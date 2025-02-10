import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import TuringArtifact from './artifacts/contracts/Turing.sol/Turing.json';
import './App.css';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [codinomes, setCodinomes] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [selectedVote, setSelectedVote] = useState('');
  const [amountIssue, setAmountIssue] = useState('');
  const [amountVote, setAmountVote] = useState('');
  const [ranking, setRanking] = useState([]);
  const [isVotingActive, setIsVotingActive] = useState(true);

  useEffect(() => {
    async function initialize() {
      const provider = await detectEthereumProvider();
      if (!provider) return alert('MetaMask não encontrado');
      
      await provider.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(provider);
      setProvider(web3Provider);
      
      const signer = web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, TuringArtifact.abi, signer);
      setContract(contractInstance);
      
      const userAccount = await signer.getAddress();
      setAccount(userAccount);
      
      loadCodinomes(contractInstance);
      updateRanking(contractInstance);
    }
    initialize();
  }, []);

  const loadCodinomes = async (contract) => {
    try {
      const names = await contract.getCodinomes();
      setCodinomes(names);
    } catch (error) {
      console.error('Erro ao carregar codinomes:', error);
    }
  };

  const updateRanking = async (contract) => {
    try {
      const names = await contract.getCodinomes();
      const rankingData = await Promise.all(names.map(async (name) => {
        const address = await contract.codinomes(name);
        const balance = await contract.balanceOf(address);
        return { name, balance: ethers.utils.formatEther(balance) };
      }));
      setRanking(rankingData.sort((a, b) => b.balance - a.balance));
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
    }
  };

  const handleTransaction = async (method, selected, amount) => {
    if (!selected || !amount) return alert('Preencha todos os campos');
    try {
      const parsedAmount = ethers.utils.parseEther(amount);
      const tx = await contract[method](selected, parsedAmount);
      await tx.wait();
      alert('Operação realizada com sucesso!');
      if (method === 'vote') {
        updateRanking(contract);
      }
    } catch (error) {
      console.error(`Erro ao executar ${method}:`, error);
      alert('Erro na operação. Verifique o console.');
    }
  };

  return (
    <div className="container">
      <h1>Turing DApp</h1>
      <div className="flex-container" style={{ display: 'flex', justifyContent: 'flex-start', gap: '40px' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2>Emitir Tokens</h2>
          <Selection codinomes={codinomes} setSelected={setSelectedIssue} />
          <InputField value={amountIssue} setValue={setAmountIssue} />
          <button onClick={() => handleTransaction('issueToken', selectedIssue, amountIssue)}>Emitir</button>
        </section>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2>Votar</h2>
          <Selection codinomes={codinomes} setSelected={setSelectedVote} />
          <InputField value={amountVote} setValue={setAmountVote} />
          <button onClick={() => handleTransaction('vote', selectedVote, amountVote)} disabled={!isVotingActive}>Votar</button>
        </section>
      </div>
      <section>
        <h2>Controle de Votação</h2>
        <button onClick={() => handleTransaction('votingOn')}>Ativar</button>
        <button onClick={() => handleTransaction('votingOff')}>Desativar</button>
      </section>
      <Ranking ranking={ranking} />
    </div>
  );
}

const Selection = ({ codinomes, setSelected }) => (
  <select onChange={(e) => setSelected(e.target.value)}>
    <option value="">Selecione</option>
    {codinomes.map((name, i) => (
      <option key={i} value={name}>{name}</option>
    ))}
  </select>
);

const InputField = ({ value, setValue }) => (
  <input type="number" placeholder="Quantidade" value={value} onChange={(e) => setValue(e.target.value)} />
);

const Ranking = ({ ranking }) => (
  <section>
    <h2>Ranking</h2>
    <ul>
      {ranking.map((entry, i) => (
        <li key={i}>{entry.name}: {entry.balance} TUR</li>
      ))}
    </ul>
  </section>
);

export default App;