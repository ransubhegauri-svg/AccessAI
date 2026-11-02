// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AccessAILearning
 * @notice Smart contract for the ACCESS-AI platform to reward students and issue course certificates as verifiable NFTs.
 * @dev Manages student reward points and ERC-721 verifiable course completion certificate NFTs on MST Testnet.
 *      Identifies students strictly by wallet address to preserve privacy on-chain.
 */
contract AccessAILearning is ERC721URIStorage, Ownable {
    using Strings for uint256;

    // =========================================================================
    // DATA STRUCTURES
    // =========================================================================

    /**
     * @notice Structure storing all details of an issued certificate NFT.
     * @param tokenId ERC-721 token identifier
     * @param certificateId Unique string identifier for the certificate (e.g., "CERT-AI-101-001")
     * @param student The wallet address of the student who earned the certificate
     * @param courseId Identifier of the course completed (e.g., "AI-ACCESS-101")
     * @param certificateHash Cryptographic hash (SHA-256 or keccak256) of certificate metadata
     * @param issueDate Unix timestamp when the certificate was minted on-chain
     * @param isValid Boolean flag indicating if certificate is active (true) or revoked (false)
     * @param exists Helper boolean flag to verify if a certificate exists
     */
    struct CertificateNFT {
        uint256 tokenId;
        string certificateId;
        address student;
        string courseId;
        string certificateHash;
        uint256 issueDate;
        bool isValid;
        bool exists;
    }

    // =========================================================================
    // STATE VARIABLES
    // =========================================================================

    /// @notice Maps each student's wallet address to their cumulative reward points balance.
    mapping(address => uint256) public studentRewardPoints;

    /// @notice Counter for generating sequential ERC-721 token IDs.
    uint256 private _nextTokenId;

    /// @notice Maps a tokenId to its CertificateNFT details.
    mapping(uint256 => CertificateNFT) private _tokenCertificates;

    /// @notice Maps a unique certificateId string to its corresponding tokenId.
    mapping(string => uint256) private _certificateIdToTokenId;

    /// @notice Maps a cryptographic certificateHash to its corresponding tokenId.
    mapping(string => uint256) private _certificateHashToTokenId;

    /// @notice Duplicate prevention: maps student address => courseId => bool.
    /// Ensures each student receives only one certificate per completed course.
    mapping(address => mapping(string => bool)) public hasCompletedCourse;

    /// @notice Maps student address => courseId => tokenId.
    mapping(address => mapping(string => uint256)) public studentCourseTokenId;

    /// @notice Tracks whether a certificate ID string has already been used.
    mapping(string => bool) public certificateIdExists;

    /// @notice Tracks whether a certificate hash has already been used.
    mapping(string => bool) public certificateHashExists;

    /// @notice Maps each student to the list of NFT token IDs they have received.
    mapping(address => uint256[]) private _studentTokenIds;

    // =========================================================================
    // EVENTS
    // =========================================================================

    /**
     * @notice Emitted whenever reward points are awarded to a student.
     * @param student Wallet address of the student receiving points
     * @param pointsAdded The amount of points added in this transaction
     * @param newTotalPoints The student's updated total point balance
     */
    event PointsAwarded(
        address indexed student,
        uint256 pointsAdded,
        uint256 newTotalPoints
    );

    /**
     * @notice Emitted when a new course completion certificate NFT is minted.
     * @param tokenId Unique ERC-721 token ID
     * @param certificateId Unique string identifier of the certificate
     * @param student Wallet address of the student recipient
     * @param courseId Identifier of the completed course
     * @param certificateHash Cryptographic hash of the certificate payload
     * @param tokenURI Metadata URI (IPFS / Data URI)
     * @param issueDate Unix timestamp of minting
     */
    event CertificateNFTIssued(
        uint256 indexed tokenId,
        string certificateId,
        address indexed student,
        string courseId,
        string certificateHash,
        string tokenURI,
        uint256 issueDate
    );

    /**
     * @notice Legacy compatibility event emitted alongside CertificateNFTIssued.
     */
    event CertificateIssued(
        string certificateId,
        address indexed student,
        string courseId,
        uint256 issueDate
    );

    /**
     * @notice Emitted when an existing certificate is revoked by the owner.
     * @param tokenId The token ID of the revoked certificate
     * @param certificateId Unique string identifier of the revoked certificate
     * @param student Wallet address of the certificate recipient
     */
    event CertificateRevoked(
        uint256 indexed tokenId,
        string certificateId,
        address indexed student
    );

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @notice Initializes the AccessAILearning ERC-721 NFT and rewards contract.
     * @dev Passes token name and symbol to ERC721 constructor and deployer to Ownable.
     */
    constructor()
        ERC721("AccessAI Course Certificate NFT", "AAICERT")
        Ownable(msg.sender)
    {}

    // =========================================================================
    // STUDENT REWARD FUNCTIONS
    // =========================================================================

    /**
     * @notice Awards points to a student for completing lessons, quizzes, or assignments.
     * @dev Only the contract owner (ACCESS-AI backend server) can call this function.
     * @param student Wallet address of the student to receive points
     * @param points Number of points to award (must be greater than 0)
     */
    function awardPoints(address student, uint256 points) external onlyOwner {
        require(student != address(0), "Invalid student address");
        require(points > 0, "Points must be greater than zero");

        studentRewardPoints[student] += points;

        emit PointsAwarded(student, points, studentRewardPoints[student]);
    }

    /**
     * @notice Retrieves the total reward points balance for a given student address.
     * @param student Wallet address of the student
     * @return Total reward points accumulated by the student
     */
    function getRewardPoints(address student) external view returns (uint256) {
        return studentRewardPoints[student];
    }

    // =========================================================================
    // CERTIFICATE NFT ISSUANCE FUNCTIONS
    // =========================================================================

    /**
     * @notice Issues an on-chain course completion certificate as an ERC-721 NFT.
     * @dev Only the contract owner can issue certificates. Prevents duplicate certificates per student and per ID.
     * @param student Wallet address of the recipient student
     * @param certificateId Unique string ID for this certificate (e.g., "CERT-PYTHON-001")
     * @param courseId Unique ID string for the completed course
     * @param certificateHash Cryptographic hash (SHA-256 or keccak256) of the certificate data
     * @param tokenURI_ Decentralized metadata URI (e.g. IPFS or Base64 JSON Data URI)
     * @return tokenId The newly minted ERC-721 token identifier
     */
    function issueCertificateNFT(
        address student,
        string calldata certificateId,
        string calldata courseId,
        string calldata certificateHash,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        return _issueCertificateNFTInternal(student, certificateId, courseId, certificateHash, tokenURI_);
    }

    /**
     * @notice Combined atomic function to award reward points and issue the certificate NFT in a single transaction.
     * @dev Prevents nonce collisions and guarantees atomic execution on MST Testnet.
     * @param student Wallet address of the student
     * @param points Amount of points to award (e.g., 50)
     * @param certificateId Unique certificate identifier
     * @param courseId Identifier of the completed course
     * @param certificateHash Cryptographic hash of the certificate
     * @param tokenURI_ Decentralized metadata URI
     * @return tokenId The newly minted ERC-721 token identifier
     */
    function awardAndIssueCertificateNFT(
        address student,
        uint256 points,
        string calldata certificateId,
        string calldata courseId,
        string calldata certificateHash,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        if (points > 0) {
            require(student != address(0), "Invalid student address");
            studentRewardPoints[student] += points;
            emit PointsAwarded(student, points, studentRewardPoints[student]);
        }
        return _issueCertificateNFTInternal(student, certificateId, courseId, certificateHash, tokenURI_);
    }

    /**
     * @notice Backward-compatible certificate issuance function for existing callers.
     * @dev Automatically mints an NFT and computes a deterministic certificate hash.
     * @param certificateId Unique ID string for this certificate
     * @param student Wallet address of the recipient student
     * @param courseId Unique ID string for the completed course
     */
    function issueCertificate(
        string calldata certificateId,
        address student,
        string calldata courseId
    ) external onlyOwner {
        string memory defaultHash = Strings.toHexString(
            uint256(keccak256(abi.encodePacked(certificateId, student, courseId, block.timestamp))),
            32
        );
        _issueCertificateNFTInternal(student, certificateId, courseId, defaultHash, "");
    }

    /**
     * @dev Internal helper executing certificate NFT minting and state storage.
     */
    function _issueCertificateNFTInternal(
        address student,
        string memory certificateId,
        string memory courseId,
        string memory certificateHash,
        string memory tokenURI_
    ) internal returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(certificateId).length > 0, "Certificate ID cannot be empty");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        require(bytes(certificateHash).length > 0, "Certificate hash cannot be empty");

        // Requirement 2: Each student receives only one certificate per completed course
        require(!hasCompletedCourse[student][courseId], "Student already earned certificate for this course");

        // Requirement 6: Duplicate prevention
        require(!certificateIdExists[certificateId], "Certificate ID already exists");
        require(!certificateHashExists[certificateHash], "Certificate hash already exists");

        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        // Mint ERC-721 NFT to student wallet address
        _safeMint(student, tokenId);

        // Store metadata URI if provided
        if (bytes(tokenURI_).length > 0) {
            _setTokenURI(tokenId, tokenURI_);
        }

        // Store Certificate NFT details
        _tokenCertificates[tokenId] = CertificateNFT({
            tokenId: tokenId,
            certificateId: certificateId,
            student: student,
            courseId: courseId,
            certificateHash: certificateHash,
            issueDate: block.timestamp,
            isValid: true,
            exists: true
        });

        // Set lookup mappings
        _certificateIdToTokenId[certificateId] = tokenId;
        _certificateHashToTokenId[certificateHash] = tokenId;
        hasCompletedCourse[student][courseId] = true;
        studentCourseTokenId[student][courseId] = tokenId;
        certificateIdExists[certificateId] = true;
        certificateHashExists[certificateHash] = true;
        _studentTokenIds[student].push(tokenId);

        emit CertificateNFTIssued(
            tokenId,
            certificateId,
            student,
            courseId,
            certificateHash,
            tokenURI_,
            block.timestamp
        );

        emit CertificateIssued(
            certificateId,
            student,
            courseId,
            block.timestamp
        );

        return tokenId;
    }

    // =========================================================================
    // CERTIFICATE VERIFICATION FUNCTIONS
    // =========================================================================

    /**
     * @notice Public verification query by Certificate ID string.
     * @dev Free view function (zero gas). Backward-compatible with previous contract signature.
     * @param certificateId The unique string identifier of the certificate
     */
    function verifyCertificate(string calldata certificateId)
        external
        view
        returns (
            bool exists,
            bool isValid,
            address student,
            string memory courseId,
            uint256 issueDate,
            uint256 tokenId,
            string memory certificateHash,
            string memory tokenURI_
        )
    {
        uint256 tid = _certificateIdToTokenId[certificateId];
        if (tid == 0 || !_tokenCertificates[tid].exists) {
            return (false, false, address(0), "", 0, 0, "", "");
        }
        CertificateNFT memory cert = _tokenCertificates[tid];
        string memory uri = "";
        try this.tokenURI(tid) returns (string memory u) {
            uri = u;
        } catch {}

        return (
            cert.exists,
            cert.isValid,
            cert.student,
            cert.courseId,
            cert.issueDate,
            cert.tokenId,
            cert.certificateHash,
            uri
        );
    }

    /**
     * @notice Public verification query by Certificate Hash.
     * @param certificateHash The cryptographic certificate hash to verify
     */
    function verifyCertificateByHash(string calldata certificateHash)
        external
        view
        returns (
            bool exists,
            bool isValid,
            address student,
            string memory courseId,
            uint256 issueDate,
            uint256 tokenId,
            string memory certificateId,
            string memory tokenURI_
        )
    {
        uint256 tid = _certificateHashToTokenId[certificateHash];
        if (tid == 0 || !_tokenCertificates[tid].exists) {
            return (false, false, address(0), "", 0, 0, "", "");
        }
        CertificateNFT memory cert = _tokenCertificates[tid];
        string memory uri = "";
        try this.tokenURI(tid) returns (string memory u) {
            uri = u;
        } catch {}

        return (
            cert.exists,
            cert.isValid,
            cert.student,
            cert.courseId,
            cert.issueDate,
            cert.tokenId,
            cert.certificateId,
            uri
        );
    }

    /**
     * @notice Public verification query by NFT Token ID.
     * @param tokenId The ERC-721 token ID to verify
     */
    function verifyCertificateByTokenId(uint256 tokenId)
        external
        view
        returns (
            bool exists,
            bool isValid,
            address student,
            string memory courseId,
            uint256 issueDate,
            string memory certificateId,
            string memory certificateHash,
            string memory tokenURI_
        )
    {
        if (tokenId == 0 || !_tokenCertificates[tokenId].exists) {
            return (false, false, address(0), "", 0, "", "", "");
        }
        CertificateNFT memory cert = _tokenCertificates[tokenId];
        string memory uri = "";
        try this.tokenURI(tokenId) returns (string memory u) {
            uri = u;
        } catch {}

        return (
            cert.exists,
            cert.isValid,
            cert.student,
            cert.courseId,
            cert.issueDate,
            cert.certificateId,
            cert.certificateHash,
            uri
        );
    }

    /**
     * @notice Quick boolean check whether a certificate exists and is valid.
     */
    function isCertificateValid(string calldata certificateId) external view returns (bool) {
        uint256 tid = _certificateIdToTokenId[certificateId];
        return tid != 0 && _tokenCertificates[tid].exists && _tokenCertificates[tid].isValid;
    }

    /**
     * @notice Quick boolean check whether a certificate hash exists and is valid.
     */
    function isCertificateHashValid(string calldata certificateHash) external view returns (bool) {
        uint256 tid = _certificateHashToTokenId[certificateHash];
        return tid != 0 && _tokenCertificates[tid].exists && _tokenCertificates[tid].isValid;
    }

    /**
     * @notice Returns the full CertificateNFT struct for a given tokenId.
     */
    function getCertificateNFT(uint256 tokenId) external view returns (CertificateNFT memory) {
        require(_tokenCertificates[tokenId].exists, "Certificate NFT does not exist");
        return _tokenCertificates[tokenId];
    }

    /**
     * @notice Returns the list of all token IDs awarded to a student address.
     */
    function getStudentTokenIds(address student) external view returns (uint256[] memory) {
        return _studentTokenIds[student];
    }

    /**
     * @notice Returns total number of certificates issued.
     */
    function totalCertificatesIssued() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Revokes an existing certificate if necessary (e.g., academic misconduct).
     * @dev Only the contract owner can revoke certificates.
     * @param tokenId The token ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_tokenCertificates[tokenId].exists, "Certificate does not exist");
        require(_tokenCertificates[tokenId].isValid, "Certificate is already revoked");

        _tokenCertificates[tokenId].isValid = false;

        emit CertificateRevoked(
            tokenId,
            _tokenCertificates[tokenId].certificateId,
            _tokenCertificates[tokenId].student
        );
    }

    /**
     * @notice Backward-compatible certificate revocation by Certificate ID.
     * @param certificateId The unique string identifier of the certificate
     */
    function revokeCertificate(string calldata certificateId) external onlyOwner {
        uint256 tid = _certificateIdToTokenId[certificateId];
        require(tid != 0 && _tokenCertificates[tid].exists, "Certificate does not exist");
        revokeCertificate(tid);
    }
}
