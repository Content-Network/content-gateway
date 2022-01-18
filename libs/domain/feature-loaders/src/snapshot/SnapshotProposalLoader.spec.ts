import {makeQUERY, Proposals,ProposalsCodec} from "./SnapshotProposalLoader"
import * as E from "fp-ts/Either";
import { createGraphQLClient } from "@banklessdao/util-data";
import { URL } from "./SnapshotProposalLoader"
import { pipe } from "fp-ts/lib/function";

const throwLeft = E.mapLeft(e=>{throw e})
describe("SnapshotProposalLoader",()=>{
    describe("codec",()=>{
        it("should work on real data",()=>{
            expect(E.isRight(ProposalsCodec.decode(realProposals))).toBe(true)
        })
    })
    describe("GraphQL call",()=>{
        const client = createGraphQLClient(URL)
        const QUERY  = makeQUERY("banklessvault.eth")
        const vars   = {
            limit:10,
            cursor:0
        }
        it("should not fail", async ()=>{
            const response = await client.query(QUERY,vars,ProposalsCodec)()
            throwLeft(response)
        })
        it("should return something that can be parsed by the codec", async ()=>{
            const response = await client.query(QUERY,vars,ProposalsCodec)()
            throwLeft(response)
            const test = ProposalsCodec.decode(response)
            test
            expect(E.isRight(ProposalsCodec.decode(response.right))).toBe(true)
        })
    })
    describe("extractCursor",()=>{
        it("should successfully extract the timestamp from the last Proposal",()=>{

        })
    })
})

const badProposals = {
    proposals: [{
        author: "me",
        created:0,
        strategies:[{name:"normal",params:{}}],
        title:"test proposal",
        choices:[],
        start:0,
        end:1,
        snapshot:"0",
        state:"open",
        
        // Optional members need to be marked undefined for ts
        space:undefined,
        type:undefined,
        body:undefined,
        link:undefined,
        scores:undefined,
        votes:undefined
    }]
}

// Used for statically testing type
const minimumProposals:Proposals = {
    proposals: [{
        id: "1",
        author: "me",
        created:0,
        strategies:[{name:"normal",params:{}}],
        title:"test proposal",
        choices:[],
        start:0,
        end:1,
        snapshot:"0",
        state:"open",
        
        // Optional members need to be marked undefined for ts
        space:undefined,
        type:undefined,
        body:undefined,
        link:undefined,
        scores:undefined,
        votes:undefined
    }]
}

// Used for statically testing type
const maximumProposals:Proposals = {
    proposals: [{
        id: "1",
        author: "me",
        created:0,
        strategies:[{name:"normal",params:{}}],
        title:"test proposal",
        choices:[],
        start:0,
        end:1,
        snapshot:"0",
        state:"open",
        
        // Optional members
        space:{
            id:"space",
            name:"a space"
        },
        type:"normal",
        body:"a body",
        link:"link",
        scores:[0,1,2],
        votes:3
    }]
}

const debug:Proposals = {
    proposals: [
      {
        id: "QmdoixPMMT76vSt6ewkE87JZJywS1piYsGC3nJJpcrPXKS",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Approve the Bankless DAO Genesis Proposal?",
        body: "---\n\nRead the proposal on Bankless Medium:\nhttps://medium.com/bankless-dao\n\nAuthors: Ryan Sean Adams, David Hoffman\nProposed: 04 May, 2021\n\nSUMMARY\nBankless LLC is requesting a one-time grant of 250,000,000 BANK vesting over 3 years (includes a 6 month cliff) for on-going participation in the Bankless DAO.\n\nBACKGROUND\nBankless LLC is a core media node for the Bankless movement led by Ryan Sean Adams and David Hoffman. In addition to founding the bankless meme it has grown several valuable media properties including:\n\n- Bankless Newsletter - 40k subscribers\n- Bankless Podcast - 400k monthly downloads\n- Bankless YouTube - 46k subscribers\n\nBankless LLC is a profitable company with revenue, expenses, employees, and contractors.\n\nBankless LLC currently has 0 BANK.\n\nThis is by design. BANK is a fair launch distribution. The only recipients of BANK at genesis are individual community participants. Despite the effort put into founding this movement and future plans to participate, neither Bankless LLC nor the Genesis team have a BANK allocation.\n\nWe think the community should change that.\n\nWe think the Bankless DAO should allocate a portion of BANK supply to Bankless LLC and the Genesis team who launched this DAO.\n\nThis isn't about the value Bankless LLC has added to date. This is about the value we can add moving forward under the right alignment.\n\nBut we've chosen not to make this allocation decision unilaterally.\n\nWe want the community's blessing and on-chain proof that the BANK holders voted to add Bankless LLC as an active participant in the Bankless DAO.\n\nThis is your call.\n\nMOTIVATION\n\nWe think you should vote YES and here's why:\n\n1) Growth\n\nFirst, both the DAO and the movement need growth. We're on track to 10x the bankless movement this year:\n\n- Grow Bankless Newsletter reach to 100k readers\n- Grow Bankless YouTube to 100k subscribers\n- Grow Bankless Podcast to 1m monthly downloads\n\nBankless LLC can act as a funnel for new participants in the DAO.\n\n2) Products\n\nSecond, the Bankless DAO needs products.\n\nWe've shown the ability to scale new crypto media products quickly. For example, Metaversal our NFT newsletter was launched in January - it now has 25k subscribers! What could a DAO managed media outlet look like?\n\nWe're also expanding into culture products. For example, we recently stealth partnered with the apparel DAO Metafactory to propagate bankless culture to scarce physical items (announcement coming soon!). These culture products can be scaled and expanded with the Bankless DAO.\n\nLastly, we can collaborate with DeFi protocols to create new offerings for the bankless community. Will protocols give group discounts to the Bankless community like this? Can we create new financial products like the BED index? Can the Bankless DAO build its own DeFi tools? We'll see.\n\nIn short: we can help you build media, culture, and DeFi products.🔥🔥🔥\n\n3) Execution\n\nThird, the Bankless DAO needs execution.\n\nVision without execution is hallucination. When DAO's fizzle out it's not due to lack of vision, it's due to lack of execution. Look at the successful ones - Aave, Synthetix, Uniswap, Sushi, Yearn. What's the thing they have in common?\n\nThey deliver. They ship. They execute.\n\nBankless LLC executes.\n\nWe've built up the bankless narrative and created one of the most successful crypto media studios in the span of 18 months. We'll bring the resources and a culture of execution to the Bankless DAO. 🥳\n\n4) People\n\nWhich brings us to the forth reason, People. Aligning human capital to the mission and governance of the DAO is critical.\n\nThis proposal aligns the following talent to Bankless DAO:\n\n- Ryan Sean Adams - Media Producer (Genesis team)\n- David Hoffman - Media Producer (Genesis team)\n- Lucas Campbell - Writer & Analyst (Genesis team)\n- Michael Wong - Memelord (Genesis team)\n- Luke Whitten - Media Operations (Genesis team)\n- Mariano Conti - Solidity Lead (Genesis team)\n- James Montgomery - Front-end Developer (Genesis team)\n- David Mihal - Developer (Genesis team)\n- Nate Welch - Developer (Genesis team)\n- Reuben Bramanathan - Regulatory & Governance (Genesis team)\n- Logan Craig - Web Designer\n- William Peaster - Writer & NFT Analyst\n\nAbove - the Genesis team and Bankless LLC contributors.\n\nAdditionally, Bankless LLC will use a portion of its allocation to allow future talent and employees to participate in the DAO.\n\n5) Partnerships\n\nThe fifth reason is Partnerships. We believe DAO-to-DAO partnerships are the future of the DeFi industry, maybe the future of every industry. 🧠\n\nHere are some DAO's Bankless LLC has already worked with:\n- Aave\n- Balancer\n- Index Coop\n- MetaFactory\n- Kyber\n- Synthetix DAO\n- Uniswap\n- YFI (via yearn contributor)\n\nAdditionally, we've partnered with a number of non-DAO ecosystem companies including Argent, Gemini, Ledger, Metamask, Zapper, and Zerion.\n\nPerhaps we can find win/wins for these entities with Bankless DAO?\n\nSo why vote yes?\n\nGrowth. Products. Execution. People. Partnerships.\n\nThat's why you should vote yes.\n\nHere's what Bankless LLC will accomplish in the first 30 days:\n\n- Provide the Genesis team members a vesting BANK allocation for getting Bankless DAO off the ground\n\n- Provide operational staffing to collect ETH Addresses from Premium \n\n- Subscribers in order to complete the Premium Member Retrospective airdrop\n\n- Stand-up next versions of DAO infrastructure including: DAO Discord, DAO Snapshot, and DAO website\n\n- Participate in governance proposals to accomplish key objectives for the DAO (including Season 1 design)\nOrganize and recruit early community talent and participants\n\nSPECIFICATION\n\nBankless LLC is requesting a one time minority grant of 250,000,000 BANK (25% of the total supply) vesting over 3 years with a 6 month cliff, in order to participate as one of the core media nodes of the Bankless DAO.\n\nThis allocation will be granted out of the DAO's genesis treasury and sent to a Bankless LLC controlled multi-sig.\n\nIf passed the community treasury will be left with 50,000,000 BANK liquid plus an additional 400,000,000 BANK vesting linearly over 3 years starting at genesis.\n\nBankless LLC will follow the DAO community treasury's linear vesting schedule of 3 years but will also add an initial 6 month cliff to it's allocation. During this cliff, Bankless LLC will receive no vesting distributions for the first 6 months. After the cliff has completed, Bankless LLC's allocation will be distributed evenly over the remaining 30 months.\n\nIf this proposal passes, 75% of BANK will still be owned and controlled by non-Bankless LLC community members via the retroactive distribution and community treasury.\n\nIf this proposal passes, the total BANK distribution would as follows:\nIf this proposal fails to pass, the total BANK distribution would remain:\n\nCONCLUSION\n\nThis Genesis proposal aligns Bankless LLC to the DAO as a media node and rewards the Genesis team for its role in launching the DAO. The allocation is a minority stake and vesting over 3 years.\n\nThe community maintains majority control.\n\nIf this proposal is passed by BANK token holders, Bankless LLC will provide foundational support for the DAO during its earliest phases and will remain long-term aligned as Bankless DAO pursues its objectives.\n\nVote YES to make Bankless LLC your first media node.\n\nLet's help the world go bankless.\n\n-Ryan Sean Adams & David Hoffman\n\n---\n\nAuthor background and commitment\n\nRyan Sean Adams is a crypto investor & co-founder of Bankless LLC. He's an open finance maximalist who propagates the message of financial sovereignty. His mission is to onboard the first billion people to crypto through memes, media, and education.\n\nDavid Hoffman is the co-founder of Bankless LLC, a content studio with a newsletter, podcast and YouTube channel focused on education on how to live a life without banks.\n\nAbout Bankless LLC\nOur financial world today is run by analog banks. Crypto money provides an alternative. The option of self-sovereign money & banking. In a world where private keys act as money and code makes that money programmable, the entire money system changes.",
        choices: [
          "Yes",
          "No",
        ],
        created: 1620135533,
        start: 1620154800,
        end: 1620414000,
        snapshot: "12389500",
        state: "closed",
        author: "0xeD7820deFdFFd1ec5Ac922a0DB721308FDaf509C",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmbCCAH3WbAFJS4FAUTvpWGmtgbaeMh1zoKgocdt3ZJmdr",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "What charity should CMS Holdings donate 100k towards? ",
        body: "Udi Wertheimer (@udiWertheimer) asked on twitter: \"which podcast wants to host me to explain why BNB is hyper-sound money\"\n\ncmsHoldings (@cmsholdings) responded with 'Bankless'\n\nhttps://twitter.com/cmsholdings/status/1389777677691805697?s=20\n\n... and then offered 100k to the charity of Bankless' choosing\n\nhttps://twitter.com/cmsholdings/status/1389778294921437184?s=20\n\nUnder the conditions that CMS Holdings donates 100k to a charity, David and Ryan will gladly host Udi Wertheimer on Bankless to hear his pitch for BNB as 'hyper-sound money', and we will provide our feedback. \n\nWe have decided to let the Bankless DAO dictate which charity to donate the 100k towards. The only criteria is 'no political donations'. \n\nAfter a brief discussion in the Bankless DAO discord, we have settled upon four possible charities:\n\n1.  Bitcoin Mining Carbon Offsetting (https://native.eco/, or other proposed charity)\n2.  Coin Center (https://www.coincenter.org/)\n3.  Covid Relief in India (https://twitter.com/sandeepnailwal/status/1385968554508488709?s=20)\n4.  Gitcoin (https://gitcoin.co/)\n\nWhat say you, Bankless DAO? \n\nWhat charity should CMS holdings donate towards? ",
        choices: [
          "Bitcoin Mining Carbon Offset",
          "Coin Center",
          "India Covid Relief",
          "Gitcoin",
        ],
        created: 1620319566,
        start: 1620327600,
        end: 1620673200,
        snapshot: "12381760",
        state: "closed",
        author: "0x25468E86ED8eC296de39FcB798C7f212924443AB",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmYvsZ7AU2XyhpBL8g4QRQbLRX6uU3t5CHNdFQbs5r7ypJ",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Badge Distribution for Second Airdrop",
        body: "Authors: @lambda @EliteViking\nCollaborators: @0x_Lucas @0xHouston \nRead the Discord discussion: [Discord ](https://discord.com/channels/834499078434979890/839883260540747826/839883549720969236)\nDate: 5/7/2021\n\n## SUMMARY\n**There are two options under consideration for this proposal:**\n\n* Replace the current “unique emails seen” scheme for the premium subscriber airdrop of 87M BANK with an even distribution to **2021 Bankless Badge holders** as of 5/31/2021 at 11:59pm UTC.\n\n* Replace the current “unique emails seen” scheme for the premium subscriber airdrop of 87M BANK with an even distribution to **2020 and 2021 Bankless Badge holders** as of 5/31/2021 at 11:59pm UTC.\n\n## BACKGROUND\nWhile the initial airdrop was meant to reward those who took the initiative to claim their badges, we still want to recognize people who subscribed to Bankless, even if they forgot to claim. This is why the original email-based distribution scheme was proposed (pro rata amount based on “unique emails seen” per Substack).\n\nUnfortunately, the above approach has several shortcomings:\n\n1. Some of our community members utilize privacy software that blocks Substack’s ability to track newsletter engagement. This means their newsletter activity wouldn’t have been recorded and thus they would receive a disproportionately low/no allocation in the airdrop.\n\n2. Additionally, many Bankless fans prefer to listen to podcasts on YouTube, etc. and therefore their engagement wouldn’t be reflected in the airdrop.\n\n3. Lastly, Bankless DAO is currently looking for community members to perform outreach in order to collect ETH addresses for the second airdrop. In terms of privacy, this is inferior to badges in which the association of claim URL to ETH address is obfuscated by POAP, which doesn’t display the claim address for a particular link. The inferior privacy of email-based distribution leads to an inconvenient experience if users wish to return BANK to their primary wallet while preserving pseudonymity. Collecting addresses needlessly expends the labor of DAO participants that could go toward more productive activities.\n\n## MOTIVATION\nA badge-based scheme achieves a more equitable distribution of tokens since it doesn’t rely on inaccurate proxies for engagement. This aids in the credibility of the DAO in the eyes of its members and the general public. Given the Bankless ethos, we shouldn’t penalize users who take extra steps to protect their privacy online.\n\nMoreover, our DAO should be equally inclusive of those who have auditory learning styles instead of biasing toward those who prefer to read.\n\nDue to the superior privacy and accuracy of the badge-based distribution mechanism, it is inherently credibly neutral and decentralized. It’s not enough to evangelize the virtues of decentralization as a DAO; we must embody them as well.\n\n## SPECIFICATION\n\n### 2021-Only Distribution\n\n* On 5/31/2021 at 11:59pm UTC, a snapshot will be taken of all addresses on ETH and xDAI that hold the **2021 Bankless Badge POAP**.\n* For each address, a count of the total number of badges held by that address will be computed.\n* The total number of badges held across all addresses will be summed.\n* The share of BANK to be allocated in the airdrop will be divided equally amongst all addresses according to the following formula:\n\nBANK claim = (87M BANK / Total # of badges) \n\n* BANK not claimed within 90 days of claims going live will be surrendered back to the community treasury.\n* The snapshot for 2021 Badge addresses will be taken from [here](https://poap.gallery/event/885)\n\n**Rationale behind switching to 2021-only:**\nAfter we locked the original thread, it came to our attention that it's no longer practical to obtain 2020 badges. **Due to technical difficulties, not everyone was *or ever will be* able to claim their badge. Details here: [Discord](https://discord.com/channels/834499078434979890/839883260540747826/840732076403327046)** \n\nThere are also some in the community who have expressed that 2020 badge holders have already received quite a generous airdrop, and going with 2021 only will allow the DAO to be more decentralized by making it viable for those folks to access the discord. As such, we believe the best path forward is a \"true even\" split among all subscribers based on the 2021 badge. I also recognize that the original naming of the \"even distribution\" proposal was somewhat confusing. This proposal is intended to resolve any ambiguities. \n\n### 2020+2021 Distribution\n\n* On 5/31/2021 at 11:59pm UTC, a snapshot will be taken of all addresses on ETH and xDAI that hold the following POAPs:\n  * 2020 Bankless Badge\n  * 2021 Bankless Badge\n* For each address, a count of the total number of badges held by that address will be computed.\n* The total number of badges held across all addresses will be summed.\n* The share of BANK to be allocated in the airdrop will be divided equally amongst all addresses according to the following formula:\n\nBANK claim = (87M BANK / Total # of badges)\n\n* BANK not claimed within 90 days of claims going live will be surrendered back to the community treasury.\n* The snapshot for 2021 Badge addresses will be taken from [here](https://poap.gallery/event/885) \n* The snapshot for 2020 Badge addresses will be taken from [here](https://poap.gallery/event/204)\n\n### Distribution Amount\n\nThe amount of BANK allocated is set to 29% of the retroactive distribution (87,000,000 BANK) per the [announcement post](https://medium.com/bankless-dao/announcing-bankless-dao-133220f5efd8). \n\n## NEXT STEPS\n\n* Bankless DAO shall announce the new distribution scheme on its public social media properties:\n  * Medium\n  * Twitter\n  * Substack\n* Bankless LLC, Ryan Sean Adams and David Hoffman are strongly encouraged to announce the new distribution scheme as well:\n  * Podcasts\n  * Discord\n  * Medium\n  * Twitter\n  * Substack\n* The Genesis Squad will oversee the computation and distribution of BANK.\n* Once the computation is complete, the airdrop should be available within the next seven days.\n* Ninety days after the claim site goes live, claims will be deactivated and remaining funds surrendered to the community treasury.\n\n## CONCLUSION\nFair genesis is critical for the perception and longevity of any DAO, so it’s important that we get it right. The current proposed subscriber airdrop is flawed in several ways. This proposal more closely aligns the distribution scheme with Bankless values while addressing the concerns of our community members. Vote “For” to help assure the future we all want.\n\n## VOTE\n\n* ### FOR (2021-only)\nAbandon the “unique emails seen” distribution scheme in favor of the **2021-only** scheme described above.\n\n* ### FOR (2020+2021)\nAbandon the “unique emails seen” distribution scheme in favor of the **2020+2021** scheme described above.\n\n* ### AGAINST\nNothing changes; preserve the status quo of using “unique emails seen” and manual collection of ETH addresses by DAO members.\n\n## FAQs\n\n**Doesn’t this mean that people who already received BANK will get a second airdrop?**\nYes, however, that would be the case under the current [genesis proposal](https://snapshot.org/#/banklessvault.eth/proposal/QmdoixPMMT76vSt6ewkE87JZJywS1piYsGC3nJJpcrPXKS) as well. This proposal is only concerned with the distribution mechanism, not the target audience of the second airdrop.\n\n**Won’t this cause a rush of new subscribers who are only interested in claiming BANK to dump?**\nNo. This is known as a [Sybil attack](https://en.wikipedia.org/wiki/Sybil_attack) and is impossible under this proposal. Anyone who subscribed in May or later would only be eligible to claim their badge on June 1st or later, which is after the deadline.\n\n**Shouldn’t we be providing extra compensation to those who forgot to claim their badge? People who already claimed are double dipping.**\nThis is a controversial topic and a distraction from the main purpose of this proposal, which is to get away from the email-based allocation scheme. If the DAO wants to provide additional compensation for those who forgot to claim their badge, that should be a separate proposal.\n\n**What happened to the duration-based option?**\nForum polling indicated that this was relatively unpopular compared to the \"even\" proposal, trailing with around half the votes. Given that the \"even\" proposal has a simple majority, we consider this sufficient to move forward with a formal vote. It's impossible to have a solution that satisfies everyone and the \"even\" proposal has the broadest support. In the original poll with no duration-based option, it achieved >80% approval.\n\n**Does this mean that users who bought badges on the secondary market would receive more BANK?**\nYes, however, this is believed to be quite rare. There's no practical way to exclude such cases, so the only way around this would be to issue a new NFT, which has its own set of issues (an extra step for many people to claim). Even if we went this route, people could still choose to speculate on the value of their new badge on the secondary market. As a result, we believe using the 2021 badge is our best option. ",
        choices: [
          "FOR: 2021 Badges Only",
          "FOR: 2020 + 2021 Badges",
          "AGAINST",
        ],
        created: 1620758474,
        start: 1620759600,
        end: 1621018800,
        snapshot: "12414778",
        state: "closed",
        author: "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmQX2DQcDTZzCpM6DTVNJutQJwWXtxJDTMpBoFjbnaM9i2",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Reward Season 0 Active Members ",
        body: "**Title**: Rewarding Season 0 Active Community Members\n**Original Conversation**: [Recorded Discord Discussion](https://discordapp.com/channels/834499078434979890/841738906473988156/848695075423649792)\n**Authors**: @frogmonkee\n**Snapshot Proposer**: @0xLucas\n**Date**: 6/2/21\n\n## SUMMARY\n\nIn order to retain talent and say thank you to everyone that has contributed to Bankless DAO over these past four weeks, this proposal will retroactively distribute 1 million $BANK based on a fair voting method available to any DAO member via [Coordinape](https://coordinape.com/). \n\nThis will serve as an initial trial for contributor compensation for future rounds in Season 1. \n\n## BACKGROUND\n\nOn Sunday May 30th, AboveAverageJoe made [this post](https://forum.bankless.community/t/ways-to-make-an-income-at-banklessdao/768/4) on forums, proposing a method to back pay all the valued community members and their contributions to the DAO. Shortly afterwards, people started filing into voice channels to discuss, and the conversation went on for hours.\n\nThis conversation was fated to happen as soon as the DAO was created. For four weeks, community members have lifted the DAO and carried it step by step. As time went on, this enthusiasm turned into concern about sustainability. The market had taken a dump and the hours everyone was putting in netted zero income.\n\nFrom quiet whispers, Joe brought this topic in the limelight. We had a healthy discussion that reinforced the DAO’s ability to ideate and work through difficult problems as a collective.\n\n## MOTIVATION\nThe motivation of this specific proposal is to retroactively distribute $BANK to valuable community members from Season 0. Typically, companies don’t spend money they don’t have, and we fall squarely into that category. But, we need to give some reward, or we will inevitably lose talent that feels unappreciated.\n\nThat’s why, for Season 0 , we propose treating $BANK as equity and not a wage. \n\n## SPECIFICATION\n\nTo distribute $BANK, four questions came up as the most important:\n\n- Who will receive $BANK?\n- How much $BANK will they receive?\n- How will they receive $BANK?\n- When will they receive $BANK?\n- Who will receive $BANK?\n\nThis is the trickiest question, isn’t it? Ideally, we want to be as inclusive as possible, but also support informed decision making and not a popularity contest.\n\nThe solution here is an opt-in program for all members. Anyone is eligible for the round and may self-select by filling out this form: https://forms.gle/4yLDFcZvq2kcFJVw7\n\nAll members who fill out this form prior to the starting period will be eligible to participate in the round\n\n**How much $BANK will they receive?**\n\nCollectively, a pool of 1,000,000 $BANK will be allocated to Coordinape. \n\n** How will they receive $BANK?**\nUsing [Coordinape](https://coordinape.com/). Coordinape is a P2P budget management tool that grew out of Yearn Finance. This is explained further below.\n\n**When will they receive $BANK?**\n\nOnce Coordinape is implemented, we will start a one week vote period with 1M $BANK, after which the funds will be proportionately distributed across participating DAO members based on the results from the Coordinape voting.\n\n**What is Coordinape?**\n\nCoordinape is central to this proposal. Coordinape was a project spun out from Yearn Finance  You can think of Coordinape as a peer to peer payroll management system. It’s broader than that, but for our purposes, it works. (For reference, Yearn’s governing DAO is a few steps ahead of BanklessDAO, but there are many parallels.)\n\nThe essence of Coordinape is allowing your peers to determine your earnings. The process works as such:\n- Each member is given 1000 GIVE tokens. Each token represents a proportional share of the salary pool (1M $BANK)\n- Members can gift (or not) GIVE tokens to people they think deserve some share of the pool.\n- After a voting period, all the unallocated GIVE tokens are burned. The remaining number of tokens represents a proportional piece of the salary pool, and members are programmatically paid their share based on the number of tokens they’ve received.\n\nThe simple premise is that if you ask everyone in the community who is doing good work, their collective answers will give a good sense of where the value is and who should be most rewarded. Over time, this also provides valuable insights for the DAO about what kinds of work is prioritized, what the community finds most valuable, and who are the key contributors in different areas.\n\nYou can learn more about Coordinape by reading their [Medium](https://medium.com/iearn/decentralized-payroll-management-for-daos-b2252160c543) announcement post, [Docs](https://docs.coordinape.com/), and [Youtube demo](https://www.youtube.com/watch?v=J8oGun8EKDE).\n\n**How would this work?**\n\nLet’s tie all these topics back together. We’re proposing that:\n\n1. Using Coordinape, we will let DAO members vote on how 1M $BANK will be allocated to their peers\n2. Any DAO member that has at least 35K $BANK is eligible and can opt in with [this form](https://forms.gle/4yLDFcZvq2kcFJVw7) \n3. Over a one week period, we will all be able to claim their tokens and allocate them to any other DAO member\n4. After the voting period, the 1M $BANK will be distributed proportionally to the number of tokens they’ve received.\n5. Participants will fill out a survey evaluating their satisfaction with their payout.\n\nSuccess is defined as a >80% satisfaction rate.\n\n## Next Steps\n\n1. Approve the proposal on Snapshot budget (1M BANK)\n2. Onboard to Coordinape\n3. Begin a one week voting period\n4. Distribute funds\n5. Take a survey\n\n## FAQ:\nHow do we know if this model will work?\n\nWe don’t. That’s part of the great blockchain experiment and why we're allocating a smaller amount of BANK to this program. It's meant to act as a trial! We’re inventing new ways to distribute money in a fairer manner. But both Sushiswap, Yearn and others use Coordinape, so there is some social proof. Internally, we will define success as a >80% satisfaction rate amongst participants.\n\nWhat about members that like to work solo?\n\nThese people will slip through the cracks. Right now, the community is small enough that we can recognize and vouch for these members. Also, Coordinape has a “regift” feature where members that were overcompensated can redistribute. This is not a great solution, but Coordinape is working on this problem.\n\n\n## Resources\n[Forum Post Draft](https://forum.bankless.community/t/draft1-rewarding-season-0-active-community-members/796)\n[Forum Post Final](https://forum.bankless.community/t/draft3-rewarding-season-0-active-community-members/825)\n",
        choices: [
          "Approve",
          "Deny",
        ],
        created: 1623198139,
        start: 1623196800,
        end: 1623456000,
        snapshot: "12597085",
        state: "closed",
        author: "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmXrfAHMoRcu5Vy3DsRTfokqLBTEKR6tqKVecLvkgw5NZf",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Bankless DAO Season 1 ",
        body: "**Title:** BanklessDAO Season 1 Proposal\n**Authors:** frogmonkee, wolfehr, 0xLucas, Kouros, mamer\n**Created Date:** 6/08/2021\n\n### SUMMARY\nThis proposal provides a scope on Seasons and requests a one-time grant of 11M BANK to the Season Grants Committee for Season 1. \n\nIf this proposal passes Snapshot, the following will happen:\n\n* Season 1 will start 7 days after this snapshot is closed (July 1st, 2021)\n* Begin election process for Season 1 Grants Committee as outlined in the spec \n* Create Grants Treasury multi-sig wallet\n* Transfer 11M $BANK to the Grants Treasury for Season 1 on July 1st\n\n### BACKGROUND\nIn the BanklessDAO announcement post, the Genesis team introduced the idea of Seasons. The concept of a season was deliberately high level and was left up to the DAO to build around.\n\nThis proposal is an attempt to capture the trends and lessons of the past month into an actionable guide for Seasons. \n\n### SPECIFICATION \n\n[Read the full specification](https://docs.google.com/document/d/1JFkkWEt87vXzBbex9yH39wojDG0O6D4BIHuES2Yc62c/edit?usp=sharing) on Seasons and special Season 1 considerations",
        choices: [
          "Approve Season 1 Specification",
          "Deny Season 1 Specification",
        ],
        created: 1623981505,
        start: 1623985200,
        end: 1624590000,
        snapshot: "12655510",
        state: "closed",
        author: "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmTCfpZirT9mUrJD8rMZKpguiCpDKASFCnGQFpk6eyUk77",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Title: BanklessDAO Season 1 Grants Committee ratification",
        body: "Authors: AAJ\nCreated Date: 07/02/2021\nSUMMARY\n\nRatify the results from the forum election and vest the following candidates with the power to receive and distribute the Season 1 Budget via the Season 1 Grants Committee 4 of 7 multisig. \n\nThe proposed Season 1 Grants Committee Members are:\n* 0xLucas\n* Kouros\n* Above Average Joe\n* Grendel \n* Iced Cool\n* Nonsense\n* James Montgomery\n\n\nBACKGROUND\n\nhttps://forum.bankless.community/t/grants-committee-election/1135/3\n\nSPECIFICATION\n\nCreate a 4 of 7 Gnosis Multisig with the above signers and transfer the Season 1 Budget from the Community treasury",
        choices: [
          "Approve",
          "Deny",
        ],
        created: 1625247750,
        start: 1625202000,
        end: 1625461140,
        snapshot: "12742069",
        state: "closed",
        author: "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmWoNKRmdn2hr1vKaoLkmuKWRQ611AiuB22JPpnDPae2m6",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "BED Index Logo Contest",
        body: "## Summary \nThe top submissions from the BED logo contest have been chosen! It's now time for the Bankless community to choose the winning submission.\n\nThe poll is single choice. Voting will close on Thursday, July 15th at 5pm EST. \n\n## Prize\n\nThe winner will be chosen based on whichever logo has the most amount of votes (in BANK) on the poll. \n\nThe top submission will win **35,000 BANK and 45 INDEX**. \n\n## Top 5 Submissions\n\nBelow are the top 5 Bankless BED logo submissions: \n\n### A) @Netsynq #9\n\n![](https://i.imgur.com/e5eot21.png=400x400)\n\n### B) @Lime_John #1\n\n![](https://i.imgur.com/YDvPHTm.png=400x400)\n\n### C) @Netsynq #1 \n\n![](https://i.imgur.com/v83ftDU.png)\n\n### D) @Ianborcic #3\n\n![](https://i.imgur.com/e6qp5Ql.png)\n\n### E) @Khubbi8 #2 \n\n![](https://i.imgur.com/9erMv09.png)",
        choices: [
          "A) @Netsynq #9",
          "B) @Lime_John #1",
          "C) @Netsynq #1",
          "D) @Ianborcic #3",
          "E) @Khubbi8 #2",
        ],
        created: 1626225236,
        start: 1626228000,
        end: 1626382800,
        snapshot: "12822029",
        state: "closed",
        author: "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmZLGKBRQTUcdET7aPsnFNJJoY2Z885j3c1813trEsUGck",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Request for funds for Notion’s ongoing subscription ",
        body: "Authors: Above Average Joe, Kouros\nSummary:\n\nNotion subscription is being paid by the Defipedia earmarked account for the DAO, Initially self funded with $2500. Defipedia needed to pay employment taxes and the funds were taken from this account, therefore the last payment to Notion has not gone through.\n\nHereby, we are requesting 2,000 USDC from the DAO’s Treasury to refill this account and be able to pay for the Notion subscription. The price of the subscription varies each month depending on the new members added to the BanklessDAO Notion account. The failed payment for this month is for $249.07\n\nThe Notion subscription is paid in fiat so the Defipedia CEO (Above Average Joe) will need to exchange the USDC into USD to be able pay for it.\n\nAll transactions will be tracked and recorded accordingly.\n\nBackground:\n\nNotion is the main tool that the DAO has to store and organize information regarding the organization. We held all kind of information related to operations, projects, Guilds, bounties, governance and so on.\nBilling for notion is discounted 20% if membership is paid for up front on an annual basis. The first month's Bill was $480. The second was $740.38. \nThe workspace’s Team Plan is set to $1,536 per year with our current membership and will renew on May 18, 2022. Adjusted for our account balance, we will be charged $1,536.\nIt is therefore critical to maintain the Notion account if we want to preserve our efforts and successes of the past few months.\n In between this time new members are expected to join and need access, and these funds will be used for this, and any other fiat expenses the Dao needs to pay.\n\nSpecification:\n\nSend 2000 USDC to Defipedia.eth\n\nDeFipedia will send reports of account holdings to the treasury guild when the balance changes.\n",
        choices: [
          "Approve",
          "Deny",
        ],
        created: 1627586860,
        start: 1627621200,
        end: 1627880400,
        snapshot: "12921898",
        state: "closed",
        author: "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "Qmdthz7Anz7g2aJJAewNqm3gQnssP5NkS2StNKELvArQkk",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: " Transfer ownership of the treasury multisig wallet from the genesis team to the DAO.",
        body: "\nBACKGROUND\n\nSince genesis, the Bankless DAO treasury multisig has been controlled by the genesis team. This is because the wallet had to be created before the DAO was launched and stabilized so that there would be a place to store the treasury.\n\nWe are now midway through season 1 and the DAO seems to have stabilized enough to allow ownership of the DAO treasury multisig from the genesis team to the DAO.\nMISSION & VALUES ALIGNMENT\n\nThis proposal would further decentralized the DAO by transferring ownership from a “centralized” genesis team to the DAO.\nSPECIFICATION\n\nTiming & Tenure\n\nOne month before the start of a season elections will be held to determine the multisig wallet holders for the upcoming season.\n\nEligibility\n\n    Any DAO member is eligible to apply.\n    There are no term limits.\n\nElection\n\n    A forum post will be made to General soliciting applications.\n\n    Applicants reply to the post with their application.\n\n    After 7 days, the application period closes. If there are not 7+ applicants, applications will remain open until 7+ applications are received.\n\n    A new post is then created for voting.\n\n    Voting lasts for 7 days. DAO members will be allowed to vote for 7 candidates.\n\n    The 7 applicants with the most votes are submitted to the DAO for approval via a snapshot vote\n\n    Voting lasts for 7 days and quorum is 20%+ of BANK\n\n    If the vote passes\n\n    New multisig wallet holders are added\n\n    Existing multisig wallet holders that will not be on it for the next season are removed\n\n    If the vote fails\n\n    Ops Guild gets feedback from the DAO and ensures the feedback is disseminated\n\n    The election process takes place again. Anyone is free to reuse an existing application\n\n    The existing multisig wallet holders remain until new holders are elected\n\nApplication\n\n    Discord handle\n    Reason for applying\n    Describe your involvement thus far at BanklessDAO\n    Qualifications - What will you bring to the committee?\n    How many hours can you commit to the DAO per week?\n    Sponsor(s) (i.e. people who will second your nomination. The more the better)\n\nRemoval of a Signer\n\n    If a multisig wallet holder becomes inactive or acts against the best interests of the DAO, they can be removed with a super-majority vote from the other multisig wallet holders\n\nSpecial Election\n\n    Multisig wallet holders can initiate a special election to fill any vacant seats, provide the special election would not overlap with the election for the next season.\n    Special Elections would follow the same process as season elections, except the election would be for the number of open seats and DAO members would get votes equal to the number of open seats.\n\nFINANCIAL IMPLICATIONS\n\n    The DAO will have to pay a transaction fee to update the signers.\n    The DAO members that have the authority to distribute treasury funds will change.\n\nNEXT STEPS\n\n    Conduct election for new multisig owners\n    Update multisig\n",
        choices: [
          "Yes",
          "No",
        ],
        created: 1631820397,
        start: 1631854800,
        end: 1632459600,
        snapshot: "13238616",
        state: "closed",
        author: "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
      {
        id: "QmSTXHWP7bjaxT9aAuoFNkaCn5Ptx7GajEDDekoBccd5Uf",
        strategies: [
          {
            name: "erc20-balance-of",
            params: {
              symbol: "BANK",
              address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              decimals: 18,
            },
          },
        ],
        title: "Bankless DAO Season 2 ",
        body: "**Title:** Bankless DAO Season 2 Specification\n**Authors:** Frogmonkee\n**Created Date:** Sept 8th, 2021\n\n### SUMMARY\n\nThis proposal introduces a specification for Bankless DAO Season 2. If this proposal passes Snapshot, the following details will fall into place:\n\n* Season 2 will start on October 8th, 2021\n* Grants Committee will perform a sanity check on affirming projects request for funding directly from the community treasury and requests going to Snapshot, keeping the total funding cap under 5M BANK. \n* Grants Committee will perform a sanity check on affirming guild budgets directly from the community treasury and requests going to Snapshot, keeping the total funding cap under 5M BANK\n* Transfer 10.5M BANK to the Grants Treasury for Season 2, with 3.5M BANK for contributor rewards and 7M for project funding during Season 2\n* In total, the Season 2 budget is capped at 20.5M BANK. \n\n### Specification \n\nYou can read the [full specification here](https://drive.google.com/file/d/1zP8OxgqQUZEP9yBL0Ovqg7B1FNtCZUja/view?usp=sharing). ",
        choices: [
          "Approve Season 2 Spec",
          "Deny Season 2 Spec",
        ],
        created: 1631835208,
        start: 1631847600,
        end: 1632452400,
        snapshot: "13239761",
        state: "closed",
        author: "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        space: {
          id: "banklessvault.eth",
          name: "Bankless DAO",
        },
        type: undefined,
        link: undefined,
        scores: undefined,
        votes: undefined,
      },
    ],
  }

const realProposals = {
    "proposals": [
      {
        "id": "QmdoixPMMT76vSt6ewkE87JZJywS1piYsGC3nJJpcrPXKS",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Approve the Bankless DAO Genesis Proposal?",
        "choices": [
          "Yes",
          "No"
        ],
        "created": 1620135533,
        "start": 1620154800,
        "end": 1620414000,
        "snapshot": "12389500",
        "state": "closed",
        "author": "0xeD7820deFdFFd1ec5Ac922a0DB721308FDaf509C",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmbCCAH3WbAFJS4FAUTvpWGmtgbaeMh1zoKgocdt3ZJmdr",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "What charity should CMS Holdings donate 100k towards? ",
        "choices": [
          "Bitcoin Mining Carbon Offset",
          "Coin Center",
          "India Covid Relief",
          "Gitcoin"
        ],
        "created": 1620319566,
        "start": 1620327600,
        "end": 1620673200,
        "snapshot": "12381760",
        "state": "closed",
        "author": "0x25468E86ED8eC296de39FcB798C7f212924443AB",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmYvsZ7AU2XyhpBL8g4QRQbLRX6uU3t5CHNdFQbs5r7ypJ",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Badge Distribution for Second Airdrop",
        "choices": [
          "FOR: 2021 Badges Only",
          "FOR: 2020 + 2021 Badges",
          "AGAINST"
        ],
        "created": 1620758474,
        "start": 1620759600,
        "end": 1621018800,
        "snapshot": "12414778",
        "state": "closed",
        "author": "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmQX2DQcDTZzCpM6DTVNJutQJwWXtxJDTMpBoFjbnaM9i2",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Reward Season 0 Active Members ",
        "choices": [
          "Approve",
          "Deny"
        ],
        "created": 1623198139,
        "start": 1623196800,
        "end": 1623456000,
        "snapshot": "12597085",
        "state": "closed",
        "author": "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmXrfAHMoRcu5Vy3DsRTfokqLBTEKR6tqKVecLvkgw5NZf",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Bankless DAO Season 1 ",
        "choices": [
          "Approve Season 1 Specification",
          "Deny Season 1 Specification"
        ],
        "created": 1623981505,
        "start": 1623985200,
        "end": 1624590000,
        "snapshot": "12655510",
        "state": "closed",
        "author": "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmTCfpZirT9mUrJD8rMZKpguiCpDKASFCnGQFpk6eyUk77",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Title: BanklessDAO Season 1 Grants Committee ratification",
        "choices": [
          "Approve",
          "Deny"
        ],
        "created": 1625247750,
        "start": 1625202000,
        "end": 1625461140,
        "snapshot": "12742069",
        "state": "closed",
        "author": "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmWoNKRmdn2hr1vKaoLkmuKWRQ611AiuB22JPpnDPae2m6",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "BED Index Logo Contest",
        "choices": [
          "A) @Netsynq #9",
          "B) @Lime_John #1",
          "C) @Netsynq #1",
          "D) @Ianborcic #3",
          "E) @Khubbi8 #2"
        ],
        "created": 1626225236,
        "start": 1626228000,
        "end": 1626382800,
        "snapshot": "12822029",
        "state": "closed",
        "author": "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmZLGKBRQTUcdET7aPsnFNJJoY2Z885j3c1813trEsUGck",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Request for funds for Notion’s ongoing subscription ",
        "choices": [
          "Approve",
          "Deny"
        ],
        "created": 1627586860,
        "start": 1627621200,
        "end": 1627880400,
        "snapshot": "12921898",
        "state": "closed",
        "author": "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "Qmdthz7Anz7g2aJJAewNqm3gQnssP5NkS2StNKELvArQkk",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": " Transfer ownership of the treasury multisig wallet from the genesis team to the DAO.",
        "choices": [
          "Yes",
          "No"
        ],
        "created": 1631820397,
        "start": 1631854800,
        "end": 1632459600,
        "snapshot": "13238616",
        "state": "closed",
        "author": "0x23dB246031fd6F4e81B0814E9C1DC0901a18Da2D",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      },

      {
        "id": "QmSTXHWP7bjaxT9aAuoFNkaCn5Ptx7GajEDDekoBccd5Uf",
        "strategies": [
          {
            "name": "erc20-balance-of",
            "params": {
              "symbol": "BANK",
              "address": "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
              "decimals": 18
            }
          }
        ],
        "title": "Bankless DAO Season 2 ",
        "choices": [
          "Approve Season 2 Spec",
          "Deny Season 2 Spec"
        ],
        "created": 1631835208,
        "start": 1631847600,
        "end": 1632452400,
        "snapshot": "13239761",
        "state": "closed",
        "author": "0x35EA12472d6fb21A9dB24B397AA2775D332C14B7",
        "space": {
          "id": "banklessvault.eth",
          "name": "Bankless DAO"
        }
      }
    ]
}