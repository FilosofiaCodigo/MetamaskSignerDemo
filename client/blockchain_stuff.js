const NETWORK_ID = 4
var accounts
var web3

signTypedDataV4Button.addEventListener('click', function (event) {
  event.preventDefault();

  const msgParams = JSON.stringify({
    domain: {
      chainId: NETWORK_ID,
      name: 'Filosofía Código',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents: 'Message!',
      security_hash: '0x123123'
    },
    primaryType: 'Main',
    types: {
      Main: [
        { name: 'contents', type: 'string' },
        { name: 'security_hash', type: 'string' }
      ],
    },
  });

  var from = accounts[0]
  console.log(from)

  var params = [from, msgParams];
  var method = 'eth_signTypedData_v4';

  web3.currentProvider.sendAsync(
    {
      method,
      params,
      from,
    },
    function (err, result) {
      if (err) return console.dir(err);
      if (result.error) {
        alert(result.error.message);
      }
      if (result.error) return console.error('ERROR', result);
      console.log('TYPED SIGNED:' + JSON.stringify(result.result));

      console.log("-------------------")
      console.log(msgParams)
      console.log(result.result)
/*
      const recovered = sigUtil.recoverTypedSignature_v4({
        data: JSON.parse(msgParams),
        sig: result.result,
      });

      if (
        ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
      ) {
        alert('Successfully recovered signer as ' + from);
      } else {
        alert(
          'Failed to verify signer when comparing ' + result + ' to ' + from
        );
      }
      */
    }
  );
});


function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

async function loadDapp() {
metamaskReloadCallback()
//document.getElementById("web3_message").textContent="Please connect to Metamask"
var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
    if (netId == NETWORK_ID) {
        var awaitContract = async function () {
        //contract = await getContract(web3);
        await window.ethereum.request({ method: "eth_requestAccounts" })
        accounts = await web3.eth.getAccounts()
        document.getElementById("web3_message").textContent="You are connected to Metamask"
        //onContractInitCallback()
        };
        awaitContract();
    } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby";
    }
    });
};
awaitWeb3();
}

loadDapp()