import React from "react";
import transactionsImg from '../../assets/transaction1.png'
 
function NoTransactions(){
    return(
        <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flexDirection: "column",
            marginBottom: "2rem"
        }}>
            <img src={transactionsImg} style={{ width: "400px", margin: "4rem"}}/>
            <p style={{ textAlign: "center", fontSize: "1.2rem"}}>You Hane No Transactions Currrently</p>

        </div>
    )
}

export default NoTransactions;