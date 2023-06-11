import React, { useEffect, useState } from "react";
import "./App.css";

const Select = ({ label, value, options, onChange }) => (
  <div className="form">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ResultTable = ({ data }) => (
  <div className="result">
    <h2>Données sélectionnées :</h2>
    <table className="result-table" id="t-v">
      <thead>
        <tr>
          <th>Marque</th>
          <th>Modèle</th>
          <th>Année</th>
          <th>Prix</th>
          <th>Code FIPE</th>
          <th>Carburant</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.year}>
            <td>{item.brand}</td>
            <td>{item.model}</td>
            <td>{item.year}</td>
            <td>{item.price}</td>
            <td>{item.codeFipe}</td>
            <td>{item.fuel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const App = () => {
  // State variables
  const [vehicleType, setVehicleType] = useState("");
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState("");
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [selectedModelName, setSelectedModelName] = useState("");
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetches the initial data
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas`
      );
      const jsonData = await response.json();

      if (Array.isArray(jsonData)) {
        setBrands(jsonData);
      } else if (jsonData && Array.isArray(jsonData)) {
        setBrands(jsonData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Event handler for vehicle type selection
  const handleVehicleTypeChange = (event) => {
    setVehicleType(event.target.value);
    setBrandId("");
    setModelId("");
    setSelectedYears([]);

    fetchBrands(event.target.value);
  };

  // Fetches the brands based on the selected vehicle type
  const fetchBrands = async (type) => {
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/${type}/marcas`
      );
      const jsonData = await response.json();

      if (Array.isArray(jsonData)) {
        setBrands(jsonData);
      } else if (jsonData && Array.isArray(jsonData)) {
        setBrands(jsonData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Event handler for brand selection
  const handleBrandChange = async (event) => {
    setBrandId(event.target.value);
    setModelId("");
    setSelectedYears([]);
    setSelectedBrandName(event.target.options[event.target.selectedIndex].text);
    setSelectedModelName("");

    if (!event.target.value) {
      return;
    }

    fetchModels(vehicleType, event.target.value);
  };

  // Fetches the models based on the selected brand and vehicle type
  const fetchModels = async (type, brand) => {
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/${type}/marcas/${brand}/modelos`
      );
      const jsonData = await response.json();

      if (Array.isArray(jsonData.modelos)) {
        setModels(jsonData.modelos);
      } else if (jsonData && Array.isArray(jsonData)) {
        setModels(jsonData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Event handler for model selection
  const handleModelChange = async (event) => {
    setModelId(event.target.value);
    setSelectedYears([]);
    setSelectedModelName(event.target.options[event.target.selectedIndex].text);

    if (!brandId || !event.target.value) {
      return;
    }

    fetchYears(vehicleType, brandId, event.target.value);
  };

  // Fetches the years based on the selected brand, model, and vehicle type
  const fetchYears = async (type, brand, model) => {
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/${type}/marcas/${brand}/modelos/${model}/anos`
      );
      const jsonData = await response.json();

      if (Array.isArray(jsonData)) {
        setYears(jsonData);
      } else if (jsonData && Array.isArray(jsonData)) {
        setYears(jsonData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Event handler for year selection
  const handleYearSelect = async (event) => {
    const selectedYearsData = Array.from(
      event.target.selectedOptions,
      (option) => ({
        codigo: option.value,
        nome: option.text,
      })
    );
    setSelectedYears(selectedYearsData);

    if (modelId && selectedYearsData.length > 0) {
      fetchPriceData(vehicleType, brandId, modelId, selectedYearsData);
    }
  };

  // Fetches the price data based on the selected brand, model, years, and vehicle type
  const fetchPriceData = async (type, brand, model, years) => {
    try {
      const promises = years.map((year) =>
        fetch(
          `https://parallelum.com.br/fipe/api/v1/${type}/marcas/${brand}/modelos/${model}/anos/${year.codigo}`
        ).then((response) => response.json())
      );

      const priceData = await Promise.all(promises);

      const updatedPriceData = priceData.map((data) => ({
        brand: selectedBrandName,
        model: selectedModelName,
        year: data.AnoModelo,
        price: data.Valor,
        codeFipe: data.CodigoFipe,
        fuel: data.Combustivel,
      }));

      setPriceData(updatedPriceData);
    } catch (error) {
      console.log(error);
    }
  };

  const vehicleTypeOptions = [
    { value: "", label: "Sélectionnez un type de véhicule" },
    { value: "carros", label: "Voitures" },
    { value: "motos", label: "Motos" },
    { value: "caminhoes", label: "Camions" },
  ];

  return (
    <div>
      <h1>Sélectionnez les informations :</h1>
      <Select
        label="Type de véhicule"
        value={vehicleType}
        options={vehicleTypeOptions}
        onChange={handleVehicleTypeChange}
        className="select-type"
      />
      <Select
        label="Marque"
        value={brandId}
        options={brands.map((brand) => ({
          value: brand.codigo,
          label: brand.nome,
        }))}
        onChange={handleBrandChange}
        className="select-brand"
      />
      <Select
        label="Modèle"
        value={modelId}
        options={models.map((model) => ({
          value: model.codigo,
          label: model.nome,
        }))}
        onChange={handleModelChange}
        className="select-model"
      />
<select multiple label="Année" value={selectedYears} onChange={handleYearSelect} className="select-year">
  {years.map((year) => (
    <option key={year.codigo} value={year.codigo} className="select-year option">
      {year.nome}
    </option>
  ))}
</select>
      {/* Display selected data */}
      {selectedYears.length > 0 && <ResultTable data={priceData} className="result-table" />}
    </div>
  );
};

export default App;
