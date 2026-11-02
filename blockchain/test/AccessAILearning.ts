import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AccessAILearning ERC-721 NFT & Rewards", function () {
  let accessAI: any;
  let owner: any;
  let student1: any;
  let student2: any;
  let unauthorizedUser: any;

  beforeEach(async function () {
    [owner, student1, student2, unauthorizedUser] = await ethers.getSigners();
    accessAI = await ethers.deployContract("AccessAILearning");
  });

  describe("Deployment & ERC-721 Metadata", function () {
    it("Should set the deployer as the owner", async function () {
      expect(await accessAI.owner()).to.equal(owner.address);
    });

    it("Should have correct ERC-721 name and symbol", async function () {
      expect(await accessAI.name()).to.equal("AccessAI Course Certificate NFT");
      expect(await accessAI.symbol()).to.equal("AAICERT");
    });
  });

  describe("Student Rewards (Points)", function () {
    it("Should start with 0 reward points for any student", async function () {
      expect(await accessAI.getRewardPoints(student1.address)).to.equal(0n);
      expect(await accessAI.studentRewardPoints(student1.address)).to.equal(0n);
    });

    it("Should allow the owner to award points and emit PointsAwarded event", async function () {
      const pointsToAward = 50n;

      await expect(accessAI.awardPoints(student1.address, pointsToAward))
        .to.emit(accessAI, "PointsAwarded")
        .withArgs(student1.address, pointsToAward, pointsToAward);

      expect(await accessAI.getRewardPoints(student1.address)).to.equal(pointsToAward);

      // Award additional points
      const additionalPoints = 50n;
      await expect(accessAI.awardPoints(student1.address, additionalPoints))
        .to.emit(accessAI, "PointsAwarded")
        .withArgs(student1.address, additionalPoints, 100n);

      expect(await accessAI.getRewardPoints(student1.address)).to.equal(100n);
    });

    it("Should maintain separate balances for different students", async function () {
      await accessAI.awardPoints(student1.address, 100n);
      await accessAI.awardPoints(student2.address, 150n);

      expect(await accessAI.getRewardPoints(student1.address)).to.equal(100n);
      expect(await accessAI.getRewardPoints(student2.address)).to.equal(150n);
    });

    it("Should prevent non-owners from awarding points", async function () {
      const nonOwner = accessAI.connect(unauthorizedUser);
      await expect(
        nonOwner.awardPoints(student1.address, 50n)
      ).to.be.revertedWithCustomError(accessAI, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);
    });
  });

  describe("ERC-721 Certificate NFT Issuance", function () {
    const certId = "CERT-AI-101-001";
    const courseId = "COURSE-PYTHON";
    const certHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const tokenURI = "data:application/json;base64,eyJuYW1lIjoiUHl0aG9uIENlcnRpZmljYXRlIn0=";

    it("Should mint an NFT to the student with metadata", async function () {
      const tx = await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      // Check NFT balance & ownership
      expect(await accessAI.balanceOf(student1.address)).to.equal(1n);
      expect(await accessAI.ownerOf(1n)).to.equal(student1.address);
      expect(await accessAI.tokenURI(1n)).to.equal(tokenURI);

      // Verify certificate by ID
      const byId = await accessAI.verifyCertificate(certId);
      expect(byId.exists).to.equal(true);
      expect(byId.isValid).to.equal(true);
      expect(byId.student).to.equal(student1.address);
      expect(byId.courseId).to.equal(courseId);
      expect(byId.tokenId).to.equal(1n);
      expect(byId.certificateHash).to.equal(certHash);
      expect(byId.tokenURI_).to.equal(tokenURI);
      expect(byId.issueDate).to.equal(block.timestamp);

      // Verify certificate by Hash
      const byHash = await accessAI.verifyCertificateByHash(certHash);
      expect(byHash.exists).to.equal(true);
      expect(byHash.tokenId).to.equal(1n);
      expect(byHash.student).to.equal(student1.address);

      // Verify certificate by Token ID
      const byTid = await accessAI.verifyCertificateByTokenId(1n);
      expect(byTid.exists).to.equal(true);
      expect(byTid.certificateId).to.equal(certId);

      // Student token IDs list
      const tokenIds = await accessAI.getStudentTokenIds(student1.address);
      expect(tokenIds.length).to.equal(1);
      expect(tokenIds[0]).to.equal(1n);
    });

    it("Should prevent duplicate certificate IDs", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      await expect(
        accessAI.issueCertificateNFT(student2.address, certId, "COURSE-OTHER", "0x9999", tokenURI)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Should prevent duplicate certificates for the same student on the same course", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      await expect(
        accessAI.issueCertificateNFT(student1.address, "CERT-DIFF-ID", courseId, "0x9999", tokenURI)
      ).to.be.revertedWith("Student already earned certificate for this course");
    });

    it("Should prevent duplicate certificate hashes", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      await expect(
        accessAI.issueCertificateNFT(student2.address, "CERT-NEW-ID", "COURSE-OTHER", certHash, tokenURI)
      ).to.be.revertedWith("Certificate hash already exists");
    });

    it("Should support atomic awardAndIssueCertificateNFT", async function () {
      const atomicCertId = "CERT-ATOMIC-001";
      const atomicCourse = "COURSE-DATABASE";
      const atomicHash = "0x1111222233334444555566667777888899990000111122223333444455556666";

      await accessAI.awardAndIssueCertificateNFT(
        student2.address,
        50n,
        atomicCertId,
        atomicCourse,
        atomicHash,
        tokenURI
      );

      // Points balance updated
      expect(await accessAI.getRewardPoints(student2.address)).to.equal(50n);

      // NFT minted
      expect(await accessAI.balanceOf(student2.address)).to.equal(1n);
      expect(await accessAI.ownerOf(1n)).to.equal(student2.address);

      const cert = await accessAI.verifyCertificate(atomicCertId);
      expect(cert.exists).to.equal(true);
      expect(cert.student).to.equal(student2.address);
    });

    it("Should support revocation and mark isValid to false while permanently preserving record", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      await expect(accessAI["revokeCertificate(uint256)"](1n))
        .to.emit(accessAI, "CertificateRevoked")
        .withArgs(1n, certId, student1.address);

      // Verify certificate by ID: record is preserved permanently!
      const status = await accessAI.verifyCertificate(certId);
      expect(status.exists).to.equal(true);
      expect(status.isValid).to.equal(false);
      expect(status.student).to.equal(student1.address);
      expect(status.courseId).to.equal(courseId);
      expect(status.certificateHash).to.equal(certHash);
      expect(status.tokenURI_).to.equal(tokenURI);
      expect(await accessAI.isCertificateValid(certId)).to.equal(false);

      // Verify certificate by Token ID: record is preserved permanently!
      const byToken = await accessAI.verifyCertificateByTokenId(1n);
      expect(byToken.exists).to.equal(true);
      expect(byToken.isValid).to.equal(false);
      expect(byToken.certificateHash).to.equal(certHash);

      // Cannot revoke an already revoked certificate
      await expect(accessAI["revokeCertificate(uint256)"](1n))
        .to.be.revertedWith("Certificate is already revoked");
    });

    it("Should support revocation by Certificate ID string", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      await expect(accessAI["revokeCertificate(string)"](certId))
        .to.emit(accessAI, "CertificateRevoked")
        .withArgs(1n, certId, student1.address);

      const status = await accessAI.verifyCertificate(certId);
      expect(status.exists).to.equal(true);
      expect(status.isValid).to.equal(false);
      expect(status.certificateHash).to.equal(certHash);
    });

    it("Should detect modified / tampered certificate hashes", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      // Original hash is valid
      expect(await accessAI.isCertificateHashValid(certHash)).to.equal(true);
      const originalVerification = await accessAI.verifyCertificateByHash(certHash);
      expect(originalVerification.exists).to.equal(true);
      expect(originalVerification.isValid).to.equal(true);

      // Tampered / modified hash (even 1 character change)
      const tamperedHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567899";
      expect(await accessAI.isCertificateHashValid(tamperedHash)).to.equal(false);
      const tamperedVerification = await accessAI.verifyCertificateByHash(tamperedHash);
      expect(tamperedVerification.exists).to.equal(false);
    });

    it("Should enforce that only authorized accounts can issue or revoke certificates", async function () {
      const nonOwner = accessAI.connect(unauthorizedUser);

      // Unauthorized issuance rejected
      await expect(
        nonOwner.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI)
      ).to.be.revertedWithCustomError(accessAI, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);

      // Issue legitimate certificate as owner
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      // Unauthorized revocation rejected
      await expect(
        nonOwner["revokeCertificate(uint256)"](1n)
      ).to.be.revertedWithCustomError(accessAI, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);

      await expect(
        nonOwner["revokeCertificate(string)"](certId)
      ).to.be.revertedWithCustomError(accessAI, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);

      // Certificate remains valid because unauthorized revocation was blocked
      expect(await accessAI.isCertificateValid(certId)).to.equal(true);
    });

    it("Should guarantee immutability: certificate record and hash cannot be overwritten", async function () {
      await accessAI.issueCertificateNFT(student1.address, certId, courseId, certHash, tokenURI);

      // Attempting to re-issue with same cert ID reverts
      await expect(
        accessAI.issueCertificateNFT(student2.address, certId, "COURSE-OTHER", "0x9999", "new-uri")
      ).to.be.revertedWith("Certificate ID already exists");

      // Attempting to re-issue with same hash reverts
      await expect(
        accessAI.issueCertificateNFT(student2.address, "CERT-NEW", "COURSE-OTHER", certHash, "new-uri")
      ).to.be.revertedWith("Certificate hash already exists");

      // Verify the record is unchanged
      const cert = await accessAI.verifyCertificate(certId);
      expect(cert.student).to.equal(student1.address);
      expect(cert.certificateHash).to.equal(certHash);
      expect(cert.tokenURI_).to.equal(tokenURI);
    });
  });
});
