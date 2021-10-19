import axios from "axios"; // Requests
import vechain from "@state/vechain"; // Vechain state container
import { ethers } from "ethers"; // Ethers
import VEXABI from "@utils/abi/vex"; // ABI: VEX Governance Token
import { find } from 'lodash';
import { useState, useEffect } from "react"; // Local state management
import { VEX_NETWORK } from "@utils/constants"; // Constants
import { createContainer } from "unstated-next";
import GovernorAlphaABI from "@utils/abi/GovernorAlpha"; // Global state provider

function useGovernance() {
  // Global state
  const { provider, address } = vechain.useContainer();

  // Contract state
  const [vexContract, setVexContract] = useState(null);
  const [governanceContract, setGovernanceContract] = useState(null);

  // Governance state
  const [vex, setVex] = useState(null);
  const [delegate, setDelegate] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [loadingProposals, setLoadingProposals] = useState(true);

  /**
   * Collect user details
   */
  const collectUser = async () => {
    await collectVexBalance();
    await collectDelegate();
  };

  /**
   * Collect VEX balance and updates in state
   */
  const collectVexBalance = async () => {
    // Collect raw balance
    const balanceOfABI = find(VEXABI, { name: "balanceOf" });
    const method = vexContract.method(balanceOfABI);
    const balanceRaw = (await method.call(address)).data;

    // Format balance to readable format
    const balance = parseFloat(ethers.utils.formatEther(balanceRaw));
    // Update balance in state
    setVex(balance);
  };

  /**
   * Collect delegates of the user updates in state
   */
  const collectDelegate = async () => {
    // Collect delegate
    const delegatesABI = find(VEXABI, { name: 'delegates' });
    const method = vexContract.method(delegatesABI);
    const delegate = (await method.call(address)).data;

    console.log(delegate);

    // Update delegate in state
    setDelegate(delegate);
  }


  /**
   * Delegates to a contract and refreshes proposals
   * @param {String} contract address for CrowdProposal
   */
  const delegateToContract = async (contract) => {
    // Delegate to contract and wait for 1 confirmation
    const tx = await vexContract.delegate(contract);
    await tx.wait(1);

    // Recollect proposals with updated information
    await collectProposals();
    return;
  };

  /**
   * Proposes a contract with sufficient votes
   * @param {String} contract address for CrowdProposal
   */
  // const proposeContract = async (contract) => {
  //   // Collect authenticated signer
  //   const signer = await provider.getSigner();

  //   // Generate CrowdProposal contract object
  //   const proposalContract = new ethers.Contract(
  //     contract,
  //     CrowdProposalABI,
  //     signer
  //   );

  //   // Call vote function and wait for 1 confirmation
  //   const tx = await proposalContract.propose();
  //   await tx.wait(1);

  //   // Recollect proposals with updated information
  //   await collectProposals();
  //   return;
  // };


  /**
   * Generates padded bytes based on type and value
   * @param {String} type solidity type
   * @param {String} value matching to solidity type
   * @returns {String} emulating ethers.Bytes
   */
  const generateBytesByType = async (type, value) => {
    switch (type) {
      // If type of value is address:
      case "address":
        // If address is ENS name
        if (!value.startsWith("0x")) {
          value = await provider.resolveName(value);
        }

        // Pad address for 20 bytes and drop 0x
        return ethers.utils.hexZeroPad(value, 32).substring(2);
      // Else if, type of value is uint256
      case "uint256":
        // Format value with appropriate decimals
        const valueDecimals = ethers.utils.parseUnits(
          Number(value).toFixed(18),
          18
        );
        // Convert BigNumber to HexString
        const valueHex = valueDecimals.toHexString();
        // Pad HexString to 32 bytes and drop 0x
        return ethers.utils.hexZeroPad(valueHex, 32).substring(2);
    }
  };

  /**
   * Generates bytes per function
   * @param {String} signature of function
   * @param {String[]} values of function params
   * @returns {String} emulating ethers.Bytes
   */
  const generateBytes = async (signature, values) => {
    // Collect types array from signature
    const typesString = signature.split("(").pop().split(")")[0];
    const typesArray = typesString.split(",");

    // Map over each type
    const bytes = await Promise.all(
      typesArray.map(
        async (type, i) =>
          // Generate bytes by type
          await generateBytesByType(type, values[i])
      )
    );

    // Return bytes
    return "0x".concat(...bytes);
  };

  /**
   * Creates a new CrowdProposal via the CrowdProposalFactory
   * @param {String[]} contracts array of target addresses
   * @param {String[]} functions array of function signatures to be called
   * @param {String[]} targets array of target params to fill
   * @param {String[]} values array of function param values to fill
   * @param {String} title of proposal
   * @param {String} description of proposal
   * @returns {String} created proposal address
   */
  const createProposal = async (
    contracts,
    functions,
    targets,
    values,
    title,
    description
  ) => {
    // Generate post markdown
    const postMarkdown = `# ${title}
    
    ${description}`;

    // Generate raw calldata
    const calldataRaw = targets.map((target, i) =>
      // By zipping target and values arrays if they exist
      typeof values[i] !== "undefined" ? [...target, ...values[i]] : [...target]
    );
    // Convert stringified calldata to bytes
    const calldataBytes = await Promise.all(
      functions.map(
        async (func, i) =>
          // By generating bytes for each individual function signature and param values
          await generateBytes(func, calldataRaw[i])
      )
    );
    // Create a new proposal
    const proposeABI = find(GovernorAlphaABI, { name: "propose" });
    const proposeMethod = governanceContract.method(proposeABI);

    const valuesPlaceholder = new Array(contracts.length).fill(0);

    // TODO: need to convert values[] into number/Bignumber types
    // Connex complains that values are not of the correct type
    // Using a placeholder for now
    const clause = proposeMethod.asClause(contracts, valuesPlaceholder, //values,
                    functions, calldataBytes, postMarkdown);

    console.log(clause);

    const { txid, signer } = await provider.vendor.sign('tx', [clause])
                                  .signer(address) // This modifier really necessary?
                                  .gas(2000000) // This is the maximum
                                  .comment("Sign to submit Proposal to GovernorAlpha")
                                  .request();

    // Collect proposal address from tx event
    // const creation_event = confirmed_tx.events.filter(
    //   (event) =>
    //     // Check if event key exists and filter by creation events
    //     event && "event" in event && event.event === "CrowdProposalCreated"
    // )[0];
    // const proposal_address = creation_event.args[0];

    // Regenerate proposals
    await collectProposals();

    // Return proposal address
    return '0x0';
  };

  const collectProposals = async () => {
    if (governanceContract) {
      // Toggle loading
      setLoadingProposals(true);

      // Collect proposals
      const response = await axios.get("/api/proposals");
      const data = response.data;

      // Update data
      setProposals(data);
      // Toggle loading
      setLoadingProposals(false);

      // Optional proposals return
      return data;
    }
  };

  /**
   * Collects proposal by contract address
   * @param {String} contract address of CrowdProposal
   * @returns {Object[]} details of a CrowdProposal contract
   */
  const collectProposalByContract = async (contract) => {
    // Setup vars
    let allProposals = proposals;
    let proposalDetails = {
      success: false,
      data: [],
    };

    // If no proposals
    if (!allProposals) {
      // Collect proposals
      allProposals = await collectProposals();
    }

    // Collect all proposal contracts
    const allProposalContracts = allProposals.map(
      (proposal) => proposal.contract
    );
    // If contract exists in all proposals
    if (allProposalContracts.includes(contract)) {
      // Update proposal details
      proposalDetails.success = true;
      proposalDetails.data = allProposals.filter(
        (proposal) => proposal.contract === contract
      )[0];
    }

    // Return proposal details
    return proposalDetails;
  };

  /**
   * Sets up contract addresses when provider is available
   */
  const setupGovernance = async () => {
    // If vechain provider is already available
    if (provider) {
      if (!vexContract) {
        // Setup VEX governance token contract
        const contractVEX = provider.thor.account(VEX_NETWORK.vex_governance_token.address);

        // Update VEX contract in global state
        await setVexContract(contractVEX);
      }
      if (!governanceContract) {
        // Setup GovernorAlpha contract
        const contractGov = provider.thor.account(VEX_NETWORK.governor_alpha.address);

        // Update Governor contract in global state
        await setGovernanceContract(contractGov);
      }
    }
  };

  /**
   * Collections to run on load
   */
  const setupUser = async () => {
    // If authenticated
    if (address && provider) {
      // Run setup functions
      collectUser();
    } else {
      // Else, nullify state
      setVex(null);
    }
  };

  // Setup contract addresses on load
  useEffect(setupGovernance, [provider]);

  // Setup governance parameters on auth
  useEffect(setupUser, [address]);

  useEffect(collectProposals, [governanceContract]);

  return {
    vex,
    governanceContract,
    delegate,
    proposals,
    loadingProposals,
    createProposal,
    collectProposalByContract,
    delegateToContract,
    // proposeContract,
  };
}

// Create unstated-next container
const governance = createContainer(useGovernance);
export default governance;
