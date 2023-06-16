import React,{useState,useEffect} from 'react'
import axios from 'axios'
import './humid.css'

const Humid = () => {
        const [info, setInfo] = useState([])
        useEffect(() => {
            const fetchData = async ()=>{
                try{
                    const res = await axios.get('http://localhost:3306/data')
                    setInfo(res.data)
                    console.log(res.data)
                } catch (error){
                    console.log(error)
                }
            }
            fetchData()
        }, [info])
    
    return (
        <div className='humid'><h3>Humidity</h3>{info[0]?.HUMIDITY}</div>
    )
}
export default Humid