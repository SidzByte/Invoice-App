import { collection, deleteDoc, doc, getDocs, query, QuerySnapshot, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { data, useNavigate } from 'react-router-dom';

const Invoice = () => {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        getData()
    }, [])

    const getData = async () => {
        setLoading(true)
        // Create a query to fetch invoices where the userId matches the logged-in user's uid
        const q = query(collection(db, "invoices"), where("uid", "==", localStorage.getItem("uid")));

        try {
            // Fetch the documents matching the query
            const querySnapshot = await getDocs(q);

            // Map the documents into a structured array
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Update the state with the fetched data
            setInvoices(data);
            console.log(data)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching invoices: ", error);
        }
    };

    const deleteInvoice = async (id) => {
        const isSure = window.confirm("are you sure want to delete ?")
        if (isSure) {
            try {
                await deleteDoc(doc(db, 'invoices', id))
                getData()
            }
            catch {
                window.alert("something is wrong")
            }
        }
        // console.log(id)
    }

    return (
        <div>
            {isLoading ?
                <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                    <i style={{ fontSize: 30 }} class="fa-solid fa-spinner fa-spin-pulse"></i>
                </div>
                :
                <div>
                    {invoices.map(data => (
                        <div className='box' key={data.id}>
                            <p>{data.to}</p>
                            <p>{new Date(data.date.seconds * 1000).toLocaleDateString()}</p>
                            <p>Rs. {data.total}</p>
                            <button onClick={() => { deleteInvoice(data.id) }} className='delete-btn'><i className="fa-solid fa-trash"></i> Delete</button>
                            <button onClick={() => { navigate('/dashboard/invoice-detail', { state: data }) }} className='delete-btn view-btn'><i className="fa-regular fa-eye"></i> View</button>


                        </div>
                    ))
                    }
                    {
                        invoices.length < 1 && <div className='no-invoice-wrapper'>
                            <p>You have no invoice till now</p>
                            <button onClick={() => { navigate('/dashboard/new-invoice') }}>Create New Invoice</button>
                        </div>
                    }
                </div>
            }
        </div>
    );
};

export default Invoice;
