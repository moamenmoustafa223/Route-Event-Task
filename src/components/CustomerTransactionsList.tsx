import {useState } from 'react';
import useCustomQuery from '../hooks/useCustomQuery';
import { ICustomer, ITransaction } from '../interfaces';
import { Table, Input, Skeleton, Select } from 'antd';
import { Chart } from 'primereact/chart';
import { CheckCircleOutlined } from '@ant-design/icons';
import 'primereact/resources/themes/saga-blue/theme.css';  
import 'primereact/resources/primereact.min.css';


const { Option } = Select;

const CustomerTransactionsList = () => {
  const [queryVersion, setQueryVersion] = useState(1);
  const [filterName, setFilterName] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<number | ''>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<number | ''>('');
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const {
    isLoading: customerIsLoading,
    data: customerData = [] as ICustomer[],
    error: customerError,
  } = useCustomQuery({
    queryKey: ['customers', `${queryVersion}`],
    url: '/customers',
  });

  const {
    isLoading: transactionIsLoading,
    data: transactionData = [] as ITransaction[],
    error: transactionError,
  } = useCustomQuery({
    queryKey: ['transactions', `${queryVersion}`],
    url: '/transactions',
  });

  // Handle loading and error states
  if (customerIsLoading || transactionIsLoading) {
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <Skeleton key={idx} active />
        ))}
      </div>
    );
  }

  if (customerError || transactionError) {
    return <div>Error loading data</div>;
  }

  // Filter customers and transactions
  const filteredCustomers = customerData.filter((customer:ICustomer) =>
    customer.name.toLowerCase().includes(filterName.toLowerCase())
  );

  const filteredTransactions = transactionData.filter((transaction:ITransaction) => {
    const amount = transaction.amount;
    return (
      (filterMinAmount === '' || amount >= filterMinAmount) &&
      (filterMaxAmount === '' || amount <= filterMaxAmount)
    );
  });

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Transaction Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Transaction Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => `+ $${text.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => <CheckCircleOutlined style={{ color: 'green' }} />,
    },
  ];

  const dataSource = filteredCustomers.flatMap((customer:ICustomer) => {
    const customerTransactions = filteredTransactions.filter((transaction:ITransaction)=> Number(transaction.customer_id) === Number(customer.id));
    return customerTransactions.map((transaction:ITransaction) => ({
      key: transaction.id,
      name: customer.name,
      date: transaction.date,
      amount: transaction.amount,
      status: 'valid',
    }));
  });

  const handleCustomerChange = (value: number) => {
    setSelectedCustomer(value);
  };

  const chartData = (customerTransactions: ITransaction[], label: string) => {
    const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
    const amounts = dates.map(date => {
      return customerTransactions
        .filter(transaction => transaction.date === date)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    return {
      labels: dates,
      datasets: [{
        label: label,
        data: amounts,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  };


  const selectedCustomerTransactions = selectedCustomer !== null ? transactionData.filter((transaction:ITransaction) => Number(transaction.customer_id) === Number(selectedCustomer)) : [];

  const allCustomersData = chartData(transactionData, 'Total amount per day for all customers');
  const selectedCustomerData = selectedCustomer !== null ? chartData(selectedCustomerTransactions, `Total amount per day for ${customerData.find((customer:ICustomer) => Number(customer.id) === Number(selectedCustomer))?.name || 'Selected Customer'}`) : { labels: [], datasets: [] };

  return (
    <div>
        <div className="my-4 p-4 bg-white shadow rounded-lg">
        <Chart type="line" data={allCustomersData} />
      </div>
      <Input
        type="text"
        placeholder="Filter by customer name"
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      <div className='flex items-center space-x-3'>

      <Input
        type="number"
        placeholder="Min transaction amount"
        value={filterMinAmount}
        onChange={(e) => setFilterMinAmount(e.target.value ? parseFloat(e.target.value) : '')}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      <Input
        type="number"
        placeholder="Max transaction amount"
        value={filterMaxAmount}
        onChange={(e) => setFilterMaxAmount(e.target.value ? parseFloat(e.target.value) : '')}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      </div>
      <Table dataSource={dataSource} columns={columns} />

      <Select
        style={{ width: 200 }}
        placeholder="Select a customer"
        onChange={handleCustomerChange}
        className="mb-4"
      >
        {customerData.map((customer:ICustomer) => (
          <Option key={customer.id} value={customer.id}>
            {customer.name}
          </Option>
        ))}
      </Select>

      {selectedCustomer !== null && (
        <div className="my-4 p-4 bg-white shadow rounded-lg">
          <Chart type="line" data={selectedCustomerData} />
        </div>
      )}
    </div>
  );
};

export default CustomerTransactionsList;
