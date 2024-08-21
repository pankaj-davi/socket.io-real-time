import React, { useEffect, useState } from 'react';
import { Avatar, Table, Tag } from 'antd';
import socketIOClient from 'socket.io-client';
import {UserOutlined} from '@ant-design/icons';
import 'antd/dist/reset.css'
import Logo from "./2023_synchrony_basic_logo.svg"
import './App.css';

function App() {
  const [testCases, setTestCases] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const endpoint = process.env.REACT_APP_API_KEY;
    const socket = socketIOClient(endpoint);

    socket.on('FromAPI', (data) => {
      console.log("Received data from API:", data);

      setTestCases(data.testCases);


      if (data.schema) {
        console.log("Schema received:", data.schema);
        const generatedColumns = generateColumnsFromSchema(data.schema);
        console.log("Generated Columns:", generatedColumns);
        setColumns(generatedColumns);
      } else {
        console.warn("No schema provided in the data.");
      }
    });

    return () => socket.disconnect();
  }, []);

  const generateColumnsFromSchema = (schema) => {
    if (!schema || typeof schema !== 'object') {
      console.error("Invalid schema:", schema);
      return [];
    }

    return Object.keys(schema).map((key) => {
      const column = {
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key: key,
        render: (text) => {
          if (key === 'status') {
            const statusColors = {
              pending: 'orange',
              running: 'blue',
              passed: 'green',
              failed: 'red'
            };
            const normalizedText = (text || '').toLowerCase();
             return <Tag color={statusColors[normalizedText] || 'default'}>{text}</Tag>;
          }
          return Array.isArray(text) ? text.join(', ') : text; 
        },
      };

      return column;
    });
  };

  return (
    <div className="App">
     <header className="App-header">
        <img src={Logo} alt="logo" />
        <Avatar size="default" icon={<UserOutlined  />} className="user-icon" />
      </header>
      <main>
        <Table
          bordered={true}
          virtual
          className="ant-table-wrapper" 
          columns={columns}
          dataSource={testCases}
          rowKey="_id" 
          pagination={false}
          size="large" 
          scroll={{
            x: 1000,
            y: 300,
          }}
        />
      </main>
    </div>
  );
}

export default App;
