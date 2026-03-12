import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("NodeSight Backend & Logic", function () {
  let nodeSightContract;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    const NodeSight = await ethers.getContractFactory("NodeSightRegistry");
    [owner, addr1] = await ethers.getSigners();

    // Deploy the contract
    nodeSightContract = await NodeSight.deploy();
  });

  describe("Scan Registry", function () {
    it("Should record a new AI scan hash", async function () {
      const scanHash = ethers.id("sample-image-data-hash");
      const metadata = "Plant Identification: Monstera Deliciosa";

      await expect(nodeSightContract.registerScan(scanHash, metadata))
        .to.emit(nodeSightContract, "ScanRecorded")
        .withArgs(owner.address, scanHash);
    });

    it("Should fail if metadata is empty", async function () {
      const scanHash = ethers.id("empty-metadata-test");
      await expect(
        nodeSightContract.registerScan(scanHash, "")
      ).to.be.revertedWith("Metadata required");
    });
  });

  describe("Access Control", function () {
    it("Should only allow the owner to update AI model pointers", async function () {
      const newModelURI = "ipfs://QmNewModelHash";
      
      // addr1 should not be able to update
      await expect(
        nodeSightContract.connect(addr1).updateModelURI(newModelURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // owner should be able to update
      await nodeSightContract.updateModelURI(newModelURI);
      expect(await nodeSightContract.currentModelURI()).to.equal(newModelURI);
    });
  });
});
