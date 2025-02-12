/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';
import './Dashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
/* eslint-enable no-unused-vars */

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [local, setLocal] = useState('');  // Novo campo
  const [entries, setEntries] = useState([]);
  const [exits, setExits] = useState([]);
  const [stock, setStock] = useState([]);
  const [chartData, setChartData] = useState({});

  const fetchMonthlyData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/monthly-data');
      const { entries, exits } = response.data;

      const months = [
        '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
        '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'
      ];

      const entryData = months.map(month => {
        const entry = entries.find(e => e.month === month);
        return entry ? entry.total_quantity : 0;
      });

      const exitData = months.map(month => {
        const exit = exits.find(e => e.month === month);
        return exit ? exit.total_quantity : 0;
      });

      const monthLabels = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      setChartData({
        labels: monthLabels,
        datasets: [
          {
            label: 'Entradas',
            data: entryData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Saídas',
            data: exitData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error.response || error.message || error);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error.response || error.message || error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stock');
      setStock(response.data);
    } catch (error) {
      console.error('Erro ao buscar estoque:', error.response || error.message || error);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/entries');
      setEntries(response.data);
    } catch (error) {
      console.error('Erro ao buscar entradas:', error.response || error.message || error);
    }
  }, []);

  const fetchExits = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/exits');
      setExits(response.data);
    } catch (error) {
      console.error('Erro ao buscar saídas:', error.response || error.message || error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'entry-control') {
      fetchEntries();
    } else if (activeTab === 'exit-control') {
      fetchExits();
    }
  }, [activeTab, fetchEntries, fetchExits]);

  const handleSaveProduct = async () => {
    if (!productName || !registrationNumber || !manufacturer || !productType || !description) {
      Swal.fire({
        title: 'Erro!',
        text: 'Todos os campos são obrigatórios.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Deseja salvar o produto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://localhost:5000/register-product', {
            productName,
            registrationNumber,
            manufacturer,
            productType,
            description,
          });
          setProductName('');
          setRegistrationNumber('');
          setManufacturer('');
          setProductType('');
          setDescription('');
          fetchStock();
          fetchProducts();
          Swal.fire({
            title: 'Sucesso!',
            text: 'Produto cadastrado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } catch (error) {
          console.error('Erro ao salvar produto:', error.response || error.message || error);
          Swal.fire({
            title: 'Erro!',
            text: 'Ocorreu um erro ao cadastrar o produto.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleSaveEntry = async () => {
    if (!selectedProduct || !quantity || !entryDate || !local) {
      Swal.fire({
        title: 'Erro!',
        text: 'Todos os campos são obrigatórios.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Deseja salvar a entrada?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://localhost:5000/register-entry', {
            selectedProduct,
            quantity,
            entryDate,
            local
          });
          setQuantity('');
          setEntryDate('');
          setLocal('');  // Limpa o campo local
          fetchEntries();
          fetchStock();
          fetchMonthlyData();
          Swal.fire({
            title: 'Sucesso!',
            text: 'Entrada registrada com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } catch (error) {
          console.error('Erro ao salvar entrada:', error.response || error.message || error);
          Swal.fire({
            title: 'Erro!',
            text: 'Ocorreu um erro ao registrar a entrada.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleSaveExit = async () => {
    if (!selectedProduct || !quantity || !exitDate || !local) {
      Swal.fire({
        title: 'Erro!',
        text: 'Todos os campos são obrigatórios.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Deseja salvar a saída?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://localhost:5000/register-exit', {
            selectedProduct,
            quantity,
            exitDate,
            local
          });
          setQuantity('');
          setExitDate('');
          setLocal('');  // Limpa o campo local
          fetchExits();
          fetchStock();
          fetchMonthlyData();
          Swal.fire({
            title: 'Sucesso!',
            text: 'Saída registrada com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } catch (error) {
          console.error('Erro ao salvar saída:', error.response || error.message || error);
          Swal.fire({
            title: 'Erro!',
            text: 'Ocorreu um erro ao registrar a saída.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleExportPDF = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Selecione Mês e Ano',
      html: `
        <select id="swal-select-month" class="swal2-select">
          ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(
            (month, index) => `<option value="${index + 1}">${month}</option>`
          ).join('')}
        </select>
        <select id="swal-select-year" class="swal2-select">
          ${[...Array(10)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return `<option value="${year}">${year}</option>`;
          }).join('')}
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const month = document.getElementById('swal-select-month').value;
        const year = document.getElementById('swal-select-year').value;
        return { month, year };
      }
    });

    if (formValues) {
      const { month, year } = formValues;
      try {
        const response = await axios.get(`http://localhost:5000/export-pdf/${year}/${month}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_mensal_${year}_${month}.pdf`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error('Erro ao exportar PDF:', error.response || error.message || error);
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="dashboard">
      <div className="tabs">
        <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('register-product')}>Cadastro de Mercadoria</button>
        <button onClick={() => setActiveTab('stock')}>Estoque</button>
        <button onClick={() => setActiveTab('entry')}>Entrada</button>
        <button onClick={() => setActiveTab('entry-control')}>Controle de Entradas</button>
        <button onClick={() => setActiveTab('exit')}>Saída</button>
        <button onClick={() => setActiveTab('exit-control')}>Controle de Saídas</button>
      </div>

      <div className="content">
        {activeTab === 'dashboard' && (
          <div>
            <h2>Controle de Entradas e Saídas</h2>
            <div className="chart-container">
              {chartData.labels && chartData.datasets.length > 0 ? (
                <Bar data={chartData} />
              ) : (
                <p>Carregando dados...</p>
              )}
            </div>
            <button className="export-pdf-button btn btn-primary" onClick={handleExportPDF}>Exportar PDF</button>
          </div>
        )}
        {activeTab === 'register-product' && (
          <div>
            <h2>Cadastro de Mercadoria</h2>
            <form onSubmit={e => { e.preventDefault(); handleSaveProduct(); }}>
              <label>Nome do Produto:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <label>Número de Registro:</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
              />
              <label>Fabricante:</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                required
              />
              <label>Tipo:</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              />
              <label>Descrição:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <button type="submit">Salvar</button>
            </form>
          </div>
        )}
        {activeTab === 'stock' && (
          <div>
            <h2>Estoque</h2>
            <form>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade no Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          </div>
        )}
        {activeTab === 'entry' && (
          <div>
            <h2>Entrada</h2>
            <form onSubmit={e => { e.preventDefault(); handleSaveEntry(); }}>
              <label>Produto:</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
                <option value="">Selecione um produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <label>Quantidade recebida:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <label>Data de entrada:</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
              <label>Local:</label>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                required
              />
              <button type="submit">Salvar</button>
            </form>
          </div>
        )}
        {activeTab === 'exit' && (
          <div>
            <h2>Saída</h2>
            <form onSubmit={e => { e.preventDefault(); handleSaveExit(); }}>
              <label>Produto:</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
                <option value="">Selecione um produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <label>Quantidade de retirada:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <label>Data de saída:</label>
              <input
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                required
              />
              <label>Local:</label>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                required
              />
              <button type="submit">Salvar</button>
            </form>
          </div>
        )}
        {activeTab === 'entry-control' && (
          <div>
            <h2>Controle de Entradas</h2>
            <form>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Data de Entrada</th>
                    <th>Local</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.productName}</td>
                      <td>{entry.quantity}</td>
                      <td>{formatDate(entry.entryDate)}</td>
                      <td>{entry.local}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          </div>
        )}
        {activeTab === 'exit-control' && (
          <div>
            <h2>Controle de Saída</h2>
            <form>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Data de Saída</th>
                    <th>Local</th>
                  </tr>
                </thead>
                <tbody>
                  {exits.map(exit => (
                    <tr key={exit.id}>
                      <td>{exit.productName}</td>
                      <td>{exit.quantity}</td>
                      <td>{formatDate(exit.exitDate)}</td>
                      <td>{exit.local}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
