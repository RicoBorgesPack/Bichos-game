
import React, { useState } from 'react';
import axios from 'axios';
import styles from 'Home.module.css';


const animalEmojis = {
  1: '🦤', 
  2: '🦅', 
  3: '🐴', 
  4: '🦋', 
  5: '🐕', 
  6: '🐐', 
  7: '🐑', 
  8: '🐪', 
  9: '🐍', 
  10: '🐇',
  11: '🐎',
  12: '🐘',
  13: '🐓',
  14: '🐈',
  15: '🐊',
  16: '🦁',
  17: '🐒',
  18: '🐖',
  19: '🦚',
  20: '🦃',
  21: '🐂',
  22: '🐅',
  23: '🐻',
  24: '🦌',
  25: '🐄'
  
};

export default function Home() {
  const [usuario, setUsuario] = useState("");
  const [numeroAnimal, setNumeroAnimal] = useState("");
  const [valorBtc, setValorBtc] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [message, setMessage] = useState("");
  const [numeroSorteado, setNumeroSorteado] = useState(null);
  const [vencedores, setVencedores] = useState([]);
  const [saldo, setSaldo] = useState(null);

  const registrarAposta = async () => {
    try {
      const response = await axios.post("http://localhost:5000/aposta", {
        usuario,
        numero_animal: parseInt(numeroAnimal),
        valor_btc: parseFloat(valorBtc)
      });
      setInvoice(response.data.invoice);
      setMessage(response.data.message);
    } catch (error) {
      console.error("Erro ao registrar aposta:", error);
      setMessage("Erro ao registrar aposta.");
    }
  };

  const confirmarPagamento = async () => {
    if (!invoice) return;
    try {
      const response = await axios.post("http://localhost:5000/pagamento", {
        invoice_id: invoice.invoice_id
      });
      setMessage(response.data.message || "Pagamento confirmado!");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      setMessage("Erro ao confirmar pagamento.");
    }
  };

  const realizarSorteio = async () => {
    try {
      const response = await axios.post("http://localhost:5000/sorteio");
      setNumeroSorteado(response.data.numero_sorteado);
      setVencedores(response.data.vencedores);
    } catch (error) {
      console.error("Erro ao realizar sorteio:", error);
      setMessage("Erro ao realizar sorteio.");
    }
  };

  const verificarSaldo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/saldo/${usuario}`);
      setSaldo(response.data.saldo);
    } catch (error) {
      console.error("Erro ao verificar saldo:", error);
      setMessage("Erro ao verificar saldo.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Jogo do Bicho com Pagamentos Lightning (Mock)</h1>
      
      <div className={styles.formContainer}>
        <h2 className={styles.subtitle}>Registrar Aposta</h2>
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Número do Animal"
          value={numeroAnimal}
          onChange={(e) => setNumeroAnimal(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Valor em BTC"
          value={valorBtc}
          onChange={(e) => setValorBtc(e.target.value)}
          className={styles.input}
        />
        <button onClick={registrarAposta} className={styles.button}>Registrar Aposta</button>
      </div>

      {invoice && (
        <div className={styles.invoiceContainer}>
          <h3 className={styles.invoiceTitle}>Invoice Gerada</h3>
          <p>Invoice ID: {invoice.invoice_id}</p>
          <p>Status: {invoice.status}</p>
          <button onClick={confirmarPagamento} className={styles.button}>Confirmar Pagamento</button>
        </div>
      )}

      <div className={styles.drawContainer}>
        <h2 className={styles.subtitle}>Realizar Sorteio</h2>
        <button onClick={realizarSorteio} className={styles.button}>Sortear Número</button>
        {numeroSorteado && (
          <p>Número Sorteado: {numeroSorteado} {animalEmojis[numeroSorteado]}</p>
        )}
        <h3 className={styles.winnerTitle}>Vencedores</h3>
        {vencedores.map((vencedor, index) => (
          <p key={index} className={styles.winnerItem}>{vencedor.usuario}: {vencedor.premio} BTC</p>
        ))}
      </div>

      <div className={styles.balanceContainer}>
        <h2 className={styles.subtitle}>Verificar Saldo</h2>
        <button onClick={verificarSaldo} className={styles.button}>Consultar Saldo</button>
        {saldo !== null && <p>Saldo de {usuario}: {saldo} BTC</p>}
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
