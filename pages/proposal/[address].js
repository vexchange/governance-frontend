import {
  collectNameByContract,
  generateActionSignatureHTML,
} from "@utils/constants"; // Parsing functions
import eth from "@state/eth"; // Global state: eth
import gfm from "remark-gfm"; // Markdown: GitHub formatting
import Head from "next/head"; // SSR Meta
import Card from "@components/Card"; // Component: Card
import Layout from "@components/Layout"; // Component: Layout
import { useRouter } from "next/router"; // Routing
import ReactMarkdown from "react-markdown"; // React Markdown
import governance from "@state/governance"; // Global governance state
import { useState, useEffect } from "react"; // React state management
import Breadcrumb from "@components/Breadcrumb"; // Component: Breadcrumb
import { collectProposals } from "pages/api/proposals"; // Server-side collection function
import styles from "@styles/pages/Proposal.module.scss"; // Component styles

export default function Proposal({ address, defaultProposalData }) {
  // Routing
  const router = useRouter();

  // Global state
  const {
    uni,
    delegate,
    proposals,
    collectProposalByContract,
    delegateToContract,
    proposeContract,
  } = governance.useContainer();
  const { address: authed, unlock } = eth.useContainer();

  // Local state
  const [data, setData] = useState(JSON.parse(defaultProposalData));
  const [buttonLoading, setButtonLoading] = useState(false);

  /**
   * Fetch proposal details
   */
  const fetchProposal = async () => {
    // Collect proposal from global state (or pull if no proposals exist)
    const proposal = await collectProposalByContract(address);

    // If proposal does not exist
    if (!proposal.success) {
      // Return to "/"
      await router.push("/");
    }

    // Else, toggle loading and update data
    setData(proposal.data);
  };

  /**
   * Delegate to contract with loading state
   */
  const delegateWithLoading = async () => {
    setButtonLoading(true); // Toggle loading

    try {
      // Call delegation with contract
      await delegateToContract(data.args[0]);
    } catch {
      // Log error
      console.log("Error when delegating to contract");
    }

    setButtonLoading(false); // Toggle loading
  };

  /**
   * Propose contract to governance with loading state
   */
  const proposeWithLoading = async () => {
    setButtonLoading(true); // Toggle loading

    try {
      // Call propose with contract
      await proposeContract(data.args[0]);
    } catch {
      // Log error
      console.log("Error when proposing contract");
    }

    setButtonLoading(false); // Toggle loading
  };

  /**
   * Support action button rendering
   * @returns {Object[]?} containing button name, handler, loading?, loadingText?
   */
  const supportActions = () => {
    // Setup button object
    let actions = {};

    // If terminated or finalized, show nothing
    if (data.status !== "Terminated" || data.status !== "Proposed") {
      // Check for authentication
      if (authed && delegate) {
        // If UNI balance
        if (uni != 0) {
          // If you haven't already delegated
          if (delegate.toLowerCase() !== data.args[0].toLowerCase()) {
            // If proposal does not have enough votes to be proposed
            if (parseFloat(data.votes) < 10000000) {
              // Enable delegating votes
              actions.name = "Delegate Votes";
              actions.handler = () => delegateWithLoading();
              actions.loading = buttonLoading;
              actions.loadingText = "Delegating Votes...";
            } else {
              // Else, enable submitting proposal (Finalized state)
              action.name = "Submit Proposal";
              actions.handler = () => proposeWithLoading();
              actions.loading = buttonLoading;
              actions.loadingText = "Submitting Proposal...";
            }
          } else {
            actions.name = "Votes Delegated";
            actions.handler = () => null;
            actions.disabled = true;
          }
        } else {
          // Else, present insufficient balance
          actions.name = "Insufficient Balance";
          actions.handler = () => null;
          actions.disabled = true;
        }
      } else {
        // If not authenticated, prompt for connecting
        actions.name = "Connect wallet";
        actions.handler = () => unlock();
      }
    }

    // Return buttons object
    return actions;
  };

  // Fetch proposal on page load (and proposals array change)
  useEffect(fetchProposal, [proposals]);

  return (
    // Pass proposal prop to prevent title/meta overlap
    <Layout proposal={true}>
      {/* Page custom meta */}
      <Head>
        {/* Update page title for proposals */}
        <title>Fish.vote | {data.title}</title>
        <meta property="og:title" content={`Fish.vote | ${data.title}`} />
        <meta property="twitter:title" content={`Fish.vote | ${data.title}`} />
      </Head>

      {/* Page title breadcrumb */}
      <Breadcrumb
        title={data.title}
        lastRoute={{
          path: "/",
          name: "Home",
        }}
        status={data.status}
        created={data.timestamp}
        proposer={data.args[1]}
      />

      {/* Support progress card */}
      <Card title="Support progress" action={supportActions()}>
        <div className={styles.card__progress}>
          {/* Render status bar based on vote count */}
          <div className={styles.card__progress_bar}>
            <div
              style={{
                width:
                  // If number of votes > 0 && < 100k
                  parseFloat(data.votes) >= 0 && parseFloat(data.votes) < 100000
                    ? // Show 1%
                      "1%"
                    : // Else, show accurate value
                      `${Math.max(
                        parseFloat(data.votes) / 10000000,
                        // Maximum fill: 100%
                        100
                      )}%`,
              }}
            />
          </div>

          {/* Vote delegation count */}
          <div className={styles.card__delegated}>
            <h4>Votes Delegated</h4>
            <h1>
              <span>{parseFloat(data.votes).toFixed(2)}</span> / 10,000,000
            </h1>
          </div>
          <p>
            This proposal needs 10M votes to progress and can be terminated by
            the author at any time.
          </p>
        </div>
      </Card>

      {/* Proposal details */}
      <Card
        title="Proposal details"
        subtext={`${data.args[4].length} action${
          // Render (s) if > 1 action
          data.args[4].length === 1 ? "" : "s"
        }`}
      >
        <div className={styles.card__details}>
          {/* Render governance actions */}
          <div className={styles.card__details_actions}>
            {data.args[2].map((contract, i) => {
              // For each contract in proposal

              // Collect contract name
              const name = collectNameByContract(contract);
              // Collect signature data
              const signatureElements = generateActionSignatureHTML(
                data.args[4][i],
                data.args[5][i]
              );

              return (
                <div key={i}>
                  {/* Action number */}
                  <span>{i + 1}</span>

                  {/* Action details */}
                  <p>
                    {/* Action contract */}
                    <a
                      href={`https://etherscan.io/address/${contract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {name}
                    </a>
                    .{signatureElements.map((element) => element)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Proposal description */}
          <div className={styles.card__details_content}>
            {data.args[6].replace(`# ${data.title}`, "") !== "" ? (
              // Render if markdown exists beyond header (thus, description)
              <ReactMarkdown remarkPlugins={[gfm]} linkTarget="_blank">
                {data.args[6]
                  // Remove markdown for header
                  .replace(`# ${data.title}`, "")
                  // Filter out new lines for description seperator
                  .replace(/\n/g, "\n")}
              </ReactMarkdown>
            ) : (
              // If no description:
              <p>No description provided.</p>
            )}
          </div>
        </div>
      </Card>
    </Layout>
  );
}

// Run on page load
export async function getServerSideProps({ params: { address } }) {
  // Collect all proposals
  const allProposals = await collectProposals();
  // Collect contract addresses
  const allProposalContracts = allProposals.map(
    (proposal) => proposal.contract
  );

  // If contract does not exist
  if (!allProposalContracts.includes(address)) {
    // Force redirect to home
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  // Else, return retrieved content
  return {
    // As prop
    props: {
      address,
      defaultProposalData: JSON.stringify(
        // Stringify data to bypass prop limitation
        allProposals.filter((proposal) => proposal.contract === address)[0]
      ),
    },
  };
}
