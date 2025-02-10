import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import TuringArtifact from './artifacts/contracts/Turing.sol/Turing.json';
import './App.css';

const TURING_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Substitua pelo endereço do contrato

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [codinomes, setCodinomes] = useState([]);
  const [selectedCodinome, setSelectedCodinome] = useState('');
  const [amount, setAmount] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Inicializa o provider, contrato e conta
  useEffect(() => {
    async function init() {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(provider);
        setProvider(web3Provider);

        const signer = web3Provider.getSigner();
        const contract = new ethers.Contract(TURING_ADDRESS, TuringArtifact.abi, signer);
        setContract(contract);

        const account = await signer.getAddress();
        setAccount(account);

        // Carrega a lista de codinomes
        try {
          const codinomesList = await contract.getCodinomes();
          setCodinomes(codinomesList);
        } catch (error) {
          console.error("Erro ao carregar codinomes:", error);
        }

        // Carrega o ranking inicial
        updateRanking(contract);
      }
    }
    init();
  }, []);


  // Atualiza o ranking de usuários
  const updateRanking = async (contract) => {
    try {
      const codinomesList = await contract.getCodinomes();
      const ranking = await Promise.all(codinomesList.map(async (codinome) => {
        const address = await contract.codinomes(codinome);
        const balance = await contract.balanceOf(address);
        return { codinome, balance: ethers.utils.formatEther(balance) };
      }));
      ranking.sort((a, b) => b.balance - a.balance);
      setRanking(ranking);
    } catch (error) {
      console.error("Erro ao atualizar ranking:", error);
    }
  };

  // Emite tokens para um codinome
  const handleIssueToken = async () => {
    try {
      const amountInSaTurings = ethers.utils.parseEther(amount.toString());
      const tx = await contract.issueToken(selectedCodinome, amountInSaTurings);
      await tx.wait();
      alert('Tokens emitidos com sucesso!');
      updateRanking(contract);
    } catch (error) {
      console.error("Erro ao emitir tokens:", error);
      alert('Erro ao emitir tokens. Verifique o console para mais detalhes.');
    }
  };

  // Vota em um codinome
  const handleVote = async () => {
    try {
      const amountInSaTurings = ethers.utils.parseEther(amount.toString());
      const tx = await contract.vote(selectedCodinome, amountInSaTurings);
      await tx.wait();
      alert('Voto registrado com sucesso!');
      updateRanking(contract);
    } catch (error) {
      console.error("Erro ao votar:", error);
      alert('Erro ao votar. Verifique o console para mais detalhes.');
    }
  };

  // Ativa a votação
  const handleVotingOn = async () => {
    try {
      const tx = await contract.votingOn();
      await tx.wait();
      setVotingEnabled(true);
      alert('Votação ativada!');
    } catch (error) {
      console.error("Erro ao ativar votação:", error);
      alert('Erro ao ativar votação. Verifique o console para mais detalhes.');
    }
  };

  // Desativa a votação
  const handleVotingOff = async () => {
    try {
      const tx = await contract.votingOff();
      await tx.wait();
      setVotingEnabled(false);
      alert('Votação desativada!');
    } catch (error) {
      console.error("Erro ao desativar votação:", error);
      alert('Erro ao desativar votação. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>DApp Turing</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>Emitir Tokens</h2>
        <select
          onChange={(e) => setSelectedCodinome(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="">Selecione um codinome</option>
          {codinomes.map((codinome, index) => (
            <option key={index} value={codinome}>{codinome}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantidade de Turings"
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button onClick={handleIssueToken} style={{ padding: '5px 10px' }}>Emitir Tokens</button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Votar</h2>
        <select
          onChange={(e) => setSelectedCodinome(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="">Selecione um codinome</option>
          {codinomes.map((codinome, index) => (
            <option key={index} value={codinome}>{codinome}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantidade de Turings"
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button
          onClick={handleVote}
          disabled={!votingEnabled}
          style={{ padding: '5px 10px' }}
        >
          Votar
        </button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Controle de Votação</h2>
        <button onClick={handleVotingOn} style={{ padding: '5px 10px', marginRight: '10px' }}>Ativar Votação</button>
        <button onClick={handleVotingOff} style={{ padding: '5px 10px' }}>Desativar Votação</button>
      </div>
      <div>
        <h2>Ranking</h2>
        <ul>
          {ranking.map((item, index) => (
            <li key={index}>
              {item.codinome}: {item.balance} TUR
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;