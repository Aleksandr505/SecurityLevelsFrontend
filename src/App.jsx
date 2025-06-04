import React, { useState, useRef, useEffect } from 'react';

function CustomSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
      <div ref={ref} style={{ position: 'relative', width: '100%' }}>
        <div
            onClick={() => setOpen(!open)}
            style={{
              padding: '0.7rem',
              borderRadius: 4,
              border: '1px solid #555',
              backgroundColor: '#2c2c3e',
              color: value ? 'white' : '#999',
              cursor: 'pointer',
              userSelect: 'none',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'box-shadow 0.3s, border-color 0.3s',
              fontSize: '1rem',
            }}
        >
          {selectedLabel}
          <span style={{ marginLeft: 8 }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
            <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#2c2c3e',
                  borderRadius: 4,
                  border: '1px solid #555',
                  maxHeight: 180,
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                }}
            >
              {options.map(opt => (
                  <div
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#cdaafe';
                        e.currentTarget.style.color = '#3a2d5f';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                      style={{
                        padding: '0.7rem 1rem',
                        cursor: 'pointer',
                        userSelect: 'none',
                        color: 'white',
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                        fontSize: '1rem',
                      }}
                  >
                    {opt.label}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

function CollapsibleItem({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
      <div style={{ marginBottom: '0.5rem', borderRadius: 4, overflow: 'hidden', border: '1px solid #555' }}>
        <button
            onClick={() => setOpen(!open)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              backgroundColor: '#3a2d5f',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              userSelect: 'none',
            }}
        >
          {open ? '▼ ' : '▶ '} {title}
        </button>
        {open && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#2c2c3e', color: 'white', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {children}
            </div>
        )}
      </div>
  );
}

function App() {
  const [screen, setScreen] = useState('home');

  // ПД состояния
  const [pdType, setPdType] = useState([]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [certOs, setCertOs] = useState('');
  const [certApp, setCertApp] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [isEmployee, setIsEmployee] = useState(false);
  const [resultCode, setResultCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  // ГИС состояния
  const [securityLevel, setSecurityLevel] = useState('');
  const [scale, setScale] = useState('');
  const [errorGis, setErrorGis] = useState('');
  const [showGisText, setShowGisText] = useState(false);
  const [gisProtectClass, setGisProtectClass] = useState(null);
  const [gisMeasures, setGisMeasures] = useState({});

  const categories = [
    'Общедоступные',
    'Специальные категории',
    'Биометрические',
    'Иные'
  ];

  const toggleCategory = (category) => {
    setPdType(prev =>
        prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category]
    );
  };

  const calculateResult = async () => {
    if (pdType.length && employeeCount && certOs && certApp && connectionType) {
      try {
        setError('');
        setExplanation('');
        setResultCode('');

        // Отправка POST-запроса на backend
        const response = await fetch('/api/level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            certOs: certOs,
            certApp: certApp,
            network: connectionType,
            number: employeeCount,
            selectedOptions: pdType,
            isEmployee: isEmployee
          })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.reason || `Ошибка сервера: ${response.status}`);

        setResultCode(data.maxLevel);
        setExplanation(data.reason);
      } catch (e) {
        setError(e.message || 'Ошибка при отправке запроса');
      }
    } else {
      setError('Пожалуйста, заполните все поля');
    }
  };

  const handleGisContinue = async () => {
    if (!securityLevel || !scale) {
      setErrorGis('Пожалуйста, заполните все поля');
      setShowGisText(false);
      return;
    }

      try {
          // Отправка POST-запроса на backend
          const response = await fetch('/api/gis', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  level: parseInt(securityLevel),
                  scale: scale,
              })
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.reason || `Ошибка сервера: ${response.status}`);
          }

          setGisProtectClass(data.protectClass);
          setGisMeasures(data.measures || {});
          setShowGisText(true);
      } catch (e) {
          setErrorGis(e.message || 'Ошибка при отправке запроса');
          setShowGisText(false);
      }
  };

  return (
      <div
          style={{
            backgroundColor: '#1e1e1e',
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '2rem',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
      >
        {screen === 'home' && (
            <div
                style={{
                  width: '100%',
                  height: '100vh',
                  backgroundColor: '#1e1e1e',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  padding: '0 2rem',
                  boxSizing: 'border-box',
                }}
            >
              <h1 style={{ marginBottom: '2rem', width: '100%', maxWidth: '600px', fontSize: '2.5rem', fontWeight: 'bold' }}>
                Выберите модуль
              </h1>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', width: '100%', maxWidth: '600px' }}>
                <button
                    onClick={() => setScreen('pd')}
                    style={buttonStyle}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#cdaafe';
                      e.currentTarget.style.color = '#3a2d5f';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#3a2d5f';
                      e.currentTarget.style.color = 'white';
                    }}
                >
                  Уровни зависимости ПД
                </button>
                <button
                    onClick={() => setScreen('gis')}
                    style={buttonStyle}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#cdaafe';
                      e.currentTarget.style.color = '#3a2d5f';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#3a2d5f';
                      e.currentTarget.style.color = 'white';
                    }}
                >
                  Класс защищенности ГИС
                </button>
              </div>
            </div>
        )}

        {screen === 'pd' && (
            <div style={{maxWidth: '600px', width: '100%', textAlign: 'left'}}>
                <button
                    onClick={() => setScreen('home')}
                    style={{...buttonStyle, marginBottom: '1rem'}}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#777';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#555';
                        e.currentTarget.style.color = 'white';
                    }}
                >
                    ← Назад
                </button>

                <h2 style={{marginBottom: '1.5rem'}}>Проверка уровня угроз</h2>

                <div style={{marginBottom: '1rem'}}>
                    <label>Тип персональных данных:</label><br/>
                    {categories.map(category => (
                        <label key={category} style={{display: 'block', margin: '4px 0', cursor: 'pointer'}}>
                            <input
                                type="checkbox"
                                checked={pdType.includes(category)}
                                onChange={() => toggleCategory(category)}
                                style={{marginRight: '0.5rem', cursor: 'pointer'}}
                            />
                            {category}
                        </label>
                    ))}
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label>Количество субъектов:</label><br/>
                    <CustomSelect
                        value={employeeCount}
                        onChange={setEmployeeCount}
                        placeholder="— выберите —"
                        options={[
                            {value: '', label: '— выберите —'},
                            {value: 'lt', label: 'До 100 тыс.'},
                            {value: 'gt', label: 'Более 100 тыс.'},
                        ]}
                    />
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label>Наличие сертификата безопасности ОС:</label><br/>
                    <CustomSelect
                        value={certOs}
                        onChange={setCertOs}
                        placeholder="— выберите —"
                        options={[
                            {value: '', label: '— выберите —'},
                            {value: 'certified', label: 'Сертифицировано'},
                            {value: 'not_certified', label: 'Не сертифицировано'},
                        ]}
                    />
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label>Наличие сертификата безопасности прикладного ПО:</label><br/>
                    <CustomSelect
                        value={certApp}
                        onChange={setCertApp}
                        placeholder="— выберите —"
                        options={[
                            {value: '', label: '— выберите —'},
                            {value: 'certified', label: 'Сертифицировано'},
                            {value: 'not_certified', label: 'Не сертифицировано'},
                        ]}
                    />
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label>Тип подключения к сети:</label><br/>
                    <CustomSelect
                        value={connectionType}
                        onChange={setConnectionType}
                        placeholder="— выберите —"
                        options={[
                            {value: '', label: '— выберите —'},
                            {value: 'local', label: 'Локальный '},
                            {value: 'network', label: 'Сетевой'},
                        ]}
                    />
                </div>

                <div style={{marginBottom: '1rem'}}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isEmployee}
                            onChange={(e) => setIsEmployee(e.target.checked)}
                            style={{marginRight: '0.5rem'}}
                        />
                        Является сотрудником организации
                    </label>
                </div>

                {error && (
                    <div style={{color: 'red', marginBottom: '1rem'}}>
                        {error}
                    </div>
                )}

                <button
                    onClick={calculateResult}
                    style={{...buttonStyle, width: '100%', marginBottom: '1rem'}}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#cdaafe';
                        e.currentTarget.style.color = '#3a2d5f';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#3a2d5f';
                        e.currentTarget.style.color = 'white';
                    }}
                >
                    Рассчитать
                </button>

                {resultCode && (
                    <div style={{marginBottom: '1rem'}}>
                        <h3>Результат:</h3>
                        <p>Максимальный уровень: <strong>{resultCode}</strong></p>
                        {explanation && <p>{explanation}</p>}
                    </div>
                )}
            </div>
        )}

          {screen === 'gis' && (
              <div style={{maxWidth: '600px', width: '100%', textAlign: 'left'}}>
                  <button
                      onClick={() => {
                          setScreen('home');
                          setShowGisText(false);
                      }}
                  style={{ ...buttonStyle, marginBottom: '1rem' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#777';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#555';
                    e.currentTarget.style.color = 'white';
                  }}
              >
                ← Назад
              </button>

              <h2 style={{ marginBottom: '1.5rem' }}>Определение класса защищенности ГИС</h2>

              {!showGisText ? (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Уровень защищенности:</label><br />
                      <CustomSelect
                          value={securityLevel}
                          onChange={setSecurityLevel}
                          placeholder="— выберите —"
                          options={[
                            { value: '', label: '— выберите —' },
                            { value: '1', label: '1' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                          ]}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label>Масштаб ГИС:</label><br />
                      <CustomSelect
                          value={scale}
                          onChange={setScale}
                          placeholder="— выберите —"
                          options={[
                            { value: '', label: '— выберите —' },
                            { value: 'OBJECT', label: 'Объектный' },
                            { value: 'REGIONAL', label: 'Региональный' },
                            { value: 'FEDERAL', label: 'Федеральный' },
                          ]}
                      />
                    </div>

                    {errorGis && (
                        <div style={{ color: 'red', marginBottom: '1rem' }}>
                          {errorGis}
                        </div>
                    )}

                    <button
                        onClick={handleGisContinue}
                        style={{ ...buttonStyle, width: '100%', marginBottom: '1rem' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#cdaafe';
                          e.currentTarget.style.color = '#3a2d5f';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#3a2d5f';
                          e.currentTarget.style.color = 'white';
                        }}
                    >
                      Продолжить
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={() => setShowGisText(false)}
                        style={{ ...buttonStyle, marginBottom: '1rem', backgroundColor: '#777' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#555';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#777';
                        }}
                    >
                      ← Назад к форме
                    </button>

                      {gisProtectClass !== null && (
                          <div style={{ marginBottom: '1.5rem' }}>
                              <h3>Класс защищенности: {gisProtectClass}</h3>
                          </div>
                      )}

                      {Object.keys(gisMeasures).length > 0 && (
                          <div>
                              <h3>Требуемые меры защиты:</h3>
                              {Object.entries(gisMeasures).map(([section, items]) => (
                                  <div key={section} style={{ marginBottom: '20px' }}>
                                      <h4>{section}</h4>
                                      <ul>
                                          {items.map((item) => (
                                              <li key={item.code}>
                                                  <strong>{item.code}:</strong> {item.text}
                                                  <br />
                                                  <em>Уровни: {item.levels.join(', ')}</em>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                      )}
                  </>
              )}
            </div>
        )}
      </div>
  );
}

const buttonStyle = {
  backgroundColor: '#3a2d5f',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  userSelect: 'none',
};

export default App;
