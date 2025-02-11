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
  const [selected, setSelected] = useState({ issue: '', vote: '' });
  const [amount, setAmount] = useState({ issue: '', vote: '' });
  const [ranking, setRanking] = useState([]);
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
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

      await loadCodinomes(contractInstance);
      await updateRanking(contractInstance);
    } catch (error) {
      console.error('Erro ao inicializar:', error);
      alert('Erro ao conectar à MetaMask. Verifique o console.');
    }
  };

  const loadCodinomes = async (contract) => {
    try {
      const names = await contract.getCodinomes();
      setCodinomes(names);
    } catch (error) {
      console.error('Erro ao carregar codinomes:', error);
      alert('Erro ao carregar codinomes. Verifique o console.');
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
      alert('Erro ao atualizar ranking. Verifique o console.');
    }
    setSelected({issue: '', vote: ''});
    setAmount({issue: '', vote: ''});
  };

  const handleIssueTokens = async () => {
    if (!selected.issue || !amount.issue) return alert('Preencha todos os campos');
    setLoading(true);
    try {
      const parsedAmount = ethers.utils.parseEther(amount.issue);
      const tx = await contract.issueToken(selected.issue, parsedAmount);
      await tx.wait();
      alert('Tokens emitidos com sucesso!');
      await updateRanking(contract);
    } catch (error) {
      console.error('Erro ao emitir tokens:', error);
      alert('Erro ao emitir tokens. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selected.vote || !amount.vote) return alert('Preencha todos os campos');
    setLoading(true);
    try {
      const parsedAmount = ethers.utils.parseEther(amount.vote);
      const tx = await contract.vote(selected.vote, parsedAmount);
      await tx.wait();
      alert('Voto realizado com sucesso!');
      await updateRanking(contract);
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao votar. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoting = async (method) => {
    setLoading(true);
    try {
      const tx = await contract[method]();
      await tx.wait();
      setIsVotingActive(method === 'votingOn');
      alert(`Votação ${method === 'votingOn' ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error(`Erro ao ${method === 'votingOn' ? 'ativar' : 'desativar'} votação:`, error);
      alert('Erro ao alterar o estado da votação. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Turing DApp</h1>
      <div className="main-content">
        <div className="actions">
          <div className="flex-container">
            <section>
              <h2>Emitir Tokens</h2>
              <Selection codinomes={codinomes} selected={selected.issue} setSelected={(value) => setSelected({ ...selected, issue: value })} />
              <InputField value={amount.issue} setValue={(value) => setAmount({ ...amount, issue: value })} />
              <button onClick={handleIssueTokens} disabled={loading}>
                {loading ? 'Processando...' : 'Emitir'}
              </button>
            </section>
            <section>
              <h2>Votar</h2>
              <Selection codinomes={codinomes} selected={selected.vote} setSelected={(value) => setSelected({ ...selected, vote: value })} />
              <InputField value={amount.vote} setValue={(value) => setAmount({ ...amount, vote: value })} />
              <button onClick={handleVote} disabled={!isVotingActive || loading}>
                {loading ? 'Processando...' : 'Votar'}
              </button>
              <p>Status da Votação: {isVotingActive ? 'Ativa' : 'Inativa'}</p>
            </section>
          </div>
          <section>
            <h2>Controle de Votação</h2>
            <button onClick={() => toggleVoting('votingOn')} disabled={loading || isVotingActive}>
              {loading ? 'Processando...' : 'Ativar'}
            </button>
            <button onClick={() => toggleVoting('votingOff')} disabled={loading || !isVotingActive}>
              {loading ? 'Processando...' : 'Desativar'}
            </button>
          </section>
        </div>
        <div className="ranking-section">
          <Ranking ranking={ranking} />
        </div>
      </div>
    </div>
  );
}

const Selection = ({ codinomes, selected, setSelected }) => (
  <select value={selected} onChange={(e) => setSelected(e.target.value)}>
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