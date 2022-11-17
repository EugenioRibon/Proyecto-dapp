// App = {
//   web3Provider: null,
//   contracts: {"Election": "Election.sol"},
//   account: '0x0',
//   init: function() {
//     return App.initWeb3();
//   },
//   initWeb3: function() {
//     console.log("init web3")
//     if (typeof web3 !== 'undefined') {
//       // If a web3 instance is already provided by Meta Mask.
//       window.ethereum.enable();
//       App.web3Provider = web3.currentProvider;
//       web3 = new Web3(web3.currentProvider);
//     } else {
//       // Specify default instance if no web3 instance provided
//       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//       web3 = new Web3(App.web3Provider);
//     }
//     return App.initContract();
//   },
//   initContract: function() {
//     console.log("Init contract")
//     $.getJSON("Election.json", function(election) {
//       // Instantiate a new truffle contract from the artifact
//       App.contracts.Election = TruffleContract(election);
//       // Connect provider to interact with contract
//       App.contracts.Election.setProvider(App.web3Provider);
//       return App.render();
//     });
//   },
//   render: function() {
//     var electionInstance;
//     var loader = $("#loader");
//     var content = $("#content");
//     loader.show();
//     content.hide();
//     // Load account data
//     web3.eth.getCoinbase(function(err, account) {
//       if (err === null) {
//         App.account = account;
//         $("#accountAddress").html("Your Account: " + account);
//       }
//     });
//     // Load contract data
//     App.contracts.Election.deployed().then(function(instance) {
//       electionInstance = instance;
//       return electionInstance.candidatesCount();
//     }).then(function(candidatesCount) {
//       var candidatesResults = $("#candidatesResults");
//       candidatesResults.empty();
//       var candidatesSelect = $('#candidatesSelect');
//       candidatesSelect.empty();
//       for (var i = 1; i <= candidatesCount; i++) {
//         electionInstance.candidates(i).then(function(candidate) {
//           var id = candidate[0];
//           var name = candidate[1];
//           var voteCount = candidate[2];
//           // Render candidate Result
//           var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
//           candidatesResults.append(candidateTemplate);
//           // Render candidate ballot option
//           var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
//           candidatesSelect.append(candidateOption);
//         });
//       }
//       return electionInstance.voters(App.account);
//     }).then(function(hasVoted) {
//       // Do not allow a user to vote
//       if(hasVoted) {
//         $('form').hide();
//       }
//       loader.hide();
//       content.show();
//     }).catch(function(error) {
  //       console.warn(error);
  //     });
  //   },
  //   castVote: function() {
//     var candidateId = $('#candidatesSelect').val();
//     App.contracts.Election.deployed().then(function(instance) {
//       return instance.vote(candidateId, { from: App.account });
//     }).then(function(result) {
  //       // Wait for votes to update
//       $("#content").hide();
//       $("#loader").show();
//     }).catch(function(err) {
  //       console.error(err);
  //     });
  //   }
  // };
  
// import "../stylesheets/app.css";
 
// Import libraries we need.
import { default as Web3} from '../../node_modules/web3';
import { default as contract } from '../../node_modules/truffle-contract';
// import { default as ethUtil} from '/ethereumjs-util';
import { default as sigUtil} from '../../node_modules/eth-sig-util';


/*
  * When you compile and deploy your Voting contract,
  * truffle stores the abi and deployed address in a json
  * file in the build directory. We will use this information
  * to setup a Voting abstraction. We will use this abstraction
  * later to create an instance of the Voting contract.
  * Compare this against the index.js from our previous tutorial to see the difference
  * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
  */

import voting_artifacts from '../../build/contracts/Voting.json'


web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
var account;
web3.eth.getAccounts().then((f) => {
    account = f[0];
})

abi = JSON.parse('[{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]')

contract = new web3.eth.Contract(abi);
contract.options.address = "0x0734ea3C54dE23448fD3dfbE20b388988506BfAC";
// update this contract address with your contract address

candidates = {"Rama": "candidate-1", "Nick": "candidate-2", "Jose": "candidate-3"}

function voteForCandidate(candidate) {
 candidateName = $("#candidate").val();
 console.log(candidateName);

 contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({from: account}).then((f) => {
  let div_id = candidates[candidateName];
  contract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call().then((f) => {
   $("#" + div_id).html(f);
  })
 })
}

$(document).ready(function() {
 candidateNames = Object.keys(candidates);

 for(var i=0; i<candidateNames.length; i++) {
 let name = candidateNames[i];
  
 contract.methods.totalVotesFor(web3.utils.asciiToHex(name)).call().then((f) => {
  $("#" + candidates[name]).html(f);
 })
 }
});

// Import the page's CSS. Webpack will know what to do with it.

var Voting = contract(voting_artifacts);

let candidates = {"Alice": "candidate-1", "Bob": "candidate-2", "Carol": "candidate-3"}

window.submitVote = function(candidate) {
  let candidateName = $("#candidate-name").val();
  let signature = $("#voter-signature").val();
  let voterAddress = $("#voter-address").val();

  console.log(candidateName);
  console.log(signature);
  console.log(voterAddress);
  
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  
  Voting.deployed().then(function(contractInstance) {
    contractInstance.voteForCandidate(candidateName, voterAddress, signature, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
      let div_id = candidates[candidateName];
      console.log(div_id);
      return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
        console.log(v.toString());
        $("#" + div_id).html(v.toString());
        $("#msg").html("");
      });
    });
  });
}

window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();

  let msgParams = [
    {
      type: 'string',      // Any valid solidity type
      name: 'Message',     // Any string label you want
      value: 'Vote for ' + candidateName  // The value to sign
    }
  ]

  var from = web3.eth.accounts[0]

  var params = [msgParams, from]
  var method = 'eth_signTypedData'

  console.log("Hash is ");
  console.log(sigUtil.typedSignatureHash(msgParams));

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error(result)
    $("#msg").html("User wants to vote for " + candidateName + ". Any one can now submit the vote to the blockchain on behalf of this user. Use the below values to submit the vote to the blockchain");
    $("#vote-for").html("Candidate: " + candidateName);
    $("#addr").html("Address: " + from);
    $("#signature").html("Signature: " + result.result);
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))
  })
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Voting.setProvider(web3.currentProvider);
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function(v) {
        $("#" + candidates[name]).html(v.toString());
      });
    })
  }
});
