const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();
    await faucet.deployed();

    const [owner, signer2] = await ethers.getSigners();
    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    const provider = ethers.provider;

    console.log("Signer 1 address: ", owner.address);
    return { faucet, owner, withdrawAmount, signer2, provider };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("shouldn't be able to withdraw more than 0.1 eth", async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );

    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it("Only owner should be able to call withdrawAll()", async function () {
    const { faucet, signer2 } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.connect(signer2).withdrawAll()).to.be.reverted;
  });

  it("Only owner should be able to call destroyFaucet()", async function () {
    const { faucet, signer2 } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.connect(signer2).destroyFaucet()).to.be.reverted;
  });

  it("The contract should self destruct after calling destroyFaucet()", async function () {
    const { faucet, provider, owner } = await loadFixture(
      deployContractAndSetVariables
    );
    await faucet.destroyFaucet();

    expect(await provider.getCode(faucet.address)).to.be.hexEqual("0x");
  });
});
