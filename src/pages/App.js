import React, { useState, useEffect } from 'react';
import { Map, TileLayer, Marker, ZoomControl, Circle, CircleMarker, Popup } from 'react-leaflet';

import api from '../services/api';

import './App.css';

export default function App() {
  const [inputAddress, setInputAddress] = useState({ address: '' });

  const [resultListAddress, setResultListAddress] = useState([]);
  const [resultListOperator, setResultListOperator] = useState([false]);

  const [userPosition, setUserPosition] = useState([0, 0]);
  const [decimalDegree, setDecimalDegree] = useState([0, 0]);
  
  const [markerOperator, setMarkerOperator] = useState([false]);

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

  function handleMarkerOnMap(id) {
    const {lat, lng} = id;
    setDecimalDegree([lat, lng]);
    setMarkerOperator([true]);
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      searchAddress();
    }
  }

  function clearFields() {
    setResultListOperator([false]);
  }
  
  function searchAddress() {
    if (inputAddress.address === '') {
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
          setResultListAddress(response.data.items);
          setResultListOperator([true]);
        }
      }).catch(() => {
        alert('Ocorreu um erro ao conectar a API ao servidor. Tente mais tarde');
      });
    }
  }
   
  function Result(props) {
    const changed = props.isChanged;
    if (changed) {
      return (
        <div className="result-box">
          {resultListAddress.map(result => (
            <div key={result.id} className="item-address" onClick={() => handleMarkerOnMap(result.position)}>
              <span>
                <i className="fas fa-map-marker-alt"></i>
              </span>
              <div>{result.address.label}</div>
            </div>
          ))}
          <div className="btn-clear-fields" onClick={() => clearFields()}>Limpar resultados</div>
        </div>
      );
    }
    else {
      return null;
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
      <div id="field">
        <div className="search-box">
          <input type="text" onChange={handleInputChange} placeholder="Digite um endereço" onKeyPress={handleKeyPress} />
          <span onClick={searchAddress}>
            <i className="fas fa-search"></i>
          </span>
        </div>
        
        <Result isChanged={resultListOperator[0]} />
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
        <Point isChanged={markerOperator[0]} />
      </Map>
    </>
  );
}