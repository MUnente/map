import React, { useState, useEffect } from 'react';
import { Map, TileLayer, Marker, ZoomControl, Circle, CircleMarker, Popup } from 'react-leaflet';

import api from '../services/api';

import './App.css';

export default function App() {
  const [inputAddress, setInputAddress] = useState({ address: '' });

  const [userPosition, setUserPosition] = useState([0, 0]);
  const [decimalDegree, setDecimalDegree] = useState([0, 0]);

  const [operator, setOperator] = useState([false]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;
      
      setUserPosition([latitude, longitude]);
      setDecimalDegree([latitude, longitude]);
    });
  }, []);

  function handleInputChange(event) {
    const {value} = event.target;
    
    setInputAddress({address: value});
  }
  
  function searchAddress() {
    if (inputAddress.address === '' ) {
      alert('Por favor, digite um endereço');
    }
    else {
      const uri = inputAddress.address;
      
      api.get(`geocode`, {
        params: {
          q: uri,
          apiKey: 'YOUR_API_KEY',
        }
      }).then(response => {
        if (response.data.items.length === 0) {
          alert('Foi encontrado um total de 0 resultados para sua busca');
        }
        else {
          const {lat, lng} = response.data.items[0].position;
          setDecimalDegree([lat, lng]);
          setOperator([true]);
        }
      }).catch(() => {
        alert('Ocorreu um erro ao conectar a API ao servidor');
      });
    }
  }

  function Point(props) {
    const changed = props.isChanged;
    if (changed) {
      return <Marker position={decimalDegree} />;
    }
    else {
      return null;
    }
  }

  return (
    <>
      <div className="search-box">
        <input type="text" onChange={handleInputChange} placeholder="Digite um endereço" />
        <span onClick={searchAddress}>
          <i className="fas fa-search"></i>
        </span>
      </div>
      
      <Map center={decimalDegree} zoom={15} zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        <Circle center={userPosition} fillColor="blue" radius={100} />
        <CircleMarker center={userPosition} color="blue" radius={2}>
          <Popup>Você está aqui</Popup>
        </CircleMarker>
        <Point isChanged={operator[0]} />
      </Map>
    </>
  );
}