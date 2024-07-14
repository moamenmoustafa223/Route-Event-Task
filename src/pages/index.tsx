import CustomerTransactionsList from "../components/CustomerTransactionsList";


const HomePage = () => {
  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="mb-9 text-center text-5xl font-bold text-blue-600">Customers Transactions</h1>
      <CustomerTransactionsList/>
    </section>
  );
};

export default HomePage;
