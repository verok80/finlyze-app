import React, { useState , useEffect } from 'react';

import Header from '../components/Header';
import Cards from '../components/Cards';
import AddExpenseModal from '../components/Modals/addExpense';
import AddIncomeModal from '../components/Modals/addIncome';
import { addDoc, collection, getDocs, query} from 'firebase/firestore';
import { db , auth } from '../firebase';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import TransactionsTable from '../components/TransactionsTable';
import ChartComponent from '../components/Charts';
import NoTransactions from '../components/NoTransactions';



function Dashboard(){
const [transactions, setTransactions]  = useState([])  ;
const [loading, setLoading] = useState(false);
const [user] = useAuthState(auth);
const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
const [income, setIncome] = useState(0);
const [expense, setExpense] = useState(0);
const [totalBalance, setTotalBalance] = useState(false);

const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
}
const showIncomeModal = () => {
    setIsIncomeModalVisible(true);
}
const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
}
const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
}

 const onFinish = (values, type) => {
    const newTransaction ={
        type: type,
        date: values.date.format("YYYY-MM-DD"),
        amount: parseFloat(values.amount),
        tag: values.tag,
        name: values.name,
    };
    addTransaction(newTransaction);
}

async function addTransaction(transaction, many){
 try {
    const docRef = await addDoc(
        collection(db,`users/${user.uid}/transactions`),
        transaction
    );
    console.log("Document written with ID:", docRef.id);
      if(!many)  toast.success("Transaction Added!");
        let newArray = transactions;
        newArray.push(transaction);
        setTransactions(newArray);
        calculateBalance();
    }catch(e) {
    console.error("Error adding document:", e);
  if(!many) toast.error("Couidn't add transaction");
    }
 }

 useEffect(() => {
//get all docs from the collection
fetchTransactions();
 }, [user]);

 useEffect(() => {
    calculateBalance();
}, [transactions]);

 const calculateBalance =() =>{
    let IncomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transactions) => {
        if(transactions.type === "income") {
            IncomeTotal += transactions.amount;
        } else {
            expensesTotal += transactions.amount;
        }
    });
    setIncome(IncomeTotal);
    setExpense(expensesTotal);
    setTotalBalance(IncomeTotal - expensesTotal);
 }

 async function fetchTransactions(){
    try{
    setLoading(true);
    if(user){
        const q = query(collection(db, `users/${user.uid}/transactions`));
        const querySnapshot = await getDocs(q);
        
      const transactionsArray = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,                // Firestore document ID (for update/delete)
        key: index.toString(),     // Needed for Ant Design table row key
        ...doc.data(),             // Your transaction data
      }));

      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    toast.error("Failed to fetch transactions.");
  } finally {
    setLoading(false);
  }
}

 let sortedTransactions = transactions.sort ((a, b) => {
   return new Date(a.date) - new Date (b.date);
    })
    return(
   <div>
        <Header/>

        {loading ? (
            <p>Loading...</p>
        ) : (
        <>
    <Cards 
    income = {income}
    expense = {expense}
    totalBalance = {totalBalance}
    showExpenseModal={showExpenseModal}
    showIncomeModal={showIncomeModal}
    />
      {transactions && transactions.length !== 0 ?<ChartComponent sortedTransactions={sortedTransactions}/>:<NoTransactions/>}
    <AddIncomeModal
    isIncomeModalVisible={isIncomeModalVisible}
    handleIncomeCancel={handleIncomeCancel}
    onFinish={onFinish}
    />
   
     <AddExpenseModal
        isExpenseModalVisible={isExpenseModalVisible}
        handleExpenseCancel={handleExpenseCancel}
        onFinish={onFinish}
        />
        <TransactionsTable transactions={transactions}
        addTransaction={addTransaction}
        fetchTransactions={fetchTransactions}
        user={user}/>
        </>
)}
   </div>
    );
}
export default Dashboard;

