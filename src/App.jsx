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
  const [pdMeasures, setPdMeasures] = useState({});
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
        setPdMeasures(data.measures || {});
      } catch (e) {
        setError(e.message || 'Ошибка при отправке запроса');
      }
    } else {
      setError('Пожалуйста, заполните все поля');
    }
  };

    const generateRandomValues = () => {
        // Пример данных для рандома из тех же опций, что и в селектах
        const employeeCountOptions = ['lt', 'gt'];
        const certOptions = ['certified', 'not_certified']; // Обновлено в соответствии с options в CustomSelect
        const connectionOptions = ['local', 'network']; // Обновлено в соответствии с options в CustomSelect

        // Для чекбокса сотрудников — случайно true/false
        const randomIsEmployeeChecked = Math.random() < 0.5;

        // Если чекбокс true, employeeCount очищаем, иначе случайно выбираем из вариантов
        const randomEmployeeCount = employeeCountOptions[Math.floor(Math.random() * employeeCountOptions.length)];

        // Случайный набор категорий (pdType) — случайно выбрать несколько из categories
        const categories = [
            'Общедоступные',
            'Специальные категории',
            'Биометрические',
            'Иные'
        ];

        // Функция для случайного выбора подмножества массива
        function getRandomSubset(arr) {
            const result = arr.filter(() => Math.random() > 0.5);
            return result.length > 0 ? result : [arr[Math.floor(Math.random() * arr.length)]];
        }

        setPdType(getRandomSubset(categories));
        setIsEmployee(randomIsEmployeeChecked);
        setEmployeeCount(randomEmployeeCount);

        // Генерация случайных значений для сертификатов и типа подключения
        setCertOs(certOptions[Math.floor(Math.random() * certOptions.length)]);
        setCertApp(certOptions[Math.floor(Math.random() * certOptions.length)]);
        setConnectionType(connectionOptions[Math.floor(Math.random() * connectionOptions.length)]);

        setError('');
        setResultCode('');
        setExplanation('');
        setPdMeasures('');
    };

  const handleGisContinue = async () => {
    if (!securityLevel || !scale) {
      setErrorGis('Пожалуйста, заполните все поля');
      setShowGisText(false);
      return;
    }

      try {
          setErrorGis('');

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

            {(screen === 'pd' || screen === 'gis') && (
                <div style={{
                    width: '100%',
                    maxWidth: screen === 'gis' ? '1400px' : '1200px',
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'flex-start'
                }}>
                    {/* Левая колонка с кнопкой назад и формой */}
                    <div style={{
                        flex: 1,
                        maxWidth: '400px',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <button
                            onClick={() => {
                                setScreen('home');
                                setShowGisText(false);
                            }}
                            style={{
                                ...buttonStyle,
                                marginBottom: '1rem',
                                backgroundColor: '#555',
                                width: '100%'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#777';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '#555';
                            }}
                        >
                            ← На главную
                        </button>

                        {screen === 'pd' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Проверка уровня угроз</h2>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Тип персональных данных:</label><br/>
                                    {categories.map(category => (
                                        <label key={category} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={pdType.includes(category)}
                                                onChange={() => toggleCategory(category)}
                                                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Количество субъектов:</label><br/>
                                    <CustomSelect
                                        value={employeeCount}
                                        onChange={setEmployeeCount}
                                        placeholder="— выберите —"
                                        options={[
                                            { value: '', label: '— выберите —' },
                                            { value: 'lt', label: 'До 100 тыс.' },
                                            { value: 'gt', label: 'Более 100 тыс.' },
                                        ]}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Наличие сертификата безопасности ОС:</label><br/>
                                    <CustomSelect
                                        value={certOs}
                                        onChange={setCertOs}
                                        placeholder="— выберите —"
                                        options={[
                                            { value: '', label: '— выберите —' },
                                            { value: 'certified', label: 'Сертифицировано' },
                                            { value: 'not_certified', label: 'Не сертифицировано' },
                                        ]}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Наличие сертификата безопасности прикладного ПО:</label><br/>
                                    <CustomSelect
                                        value={certApp}
                                        onChange={setCertApp}
                                        placeholder="— выберите —"
                                        options={[
                                            { value: '', label: '— выберите —' },
                                            { value: 'certified', label: 'Сертифицировано' },
                                            { value: 'not_certified', label: 'Не сертифицировано' },
                                        ]}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Тип подключения к сети:</label><br/>
                                    <CustomSelect
                                        value={connectionType}
                                        onChange={setConnectionType}
                                        placeholder="— выберите —"
                                        options={[
                                            { value: '', label: '— выберите —' },
                                            { value: 'local', label: 'Локальный' },
                                            { value: 'network', label: 'Сетевой' },
                                        ]}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isEmployee}
                                            onChange={(e) => setIsEmployee(e.target.checked)}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Является сотрудником организации
                                    </label>
                                </div>

                                {error && (
                                    <div style={{ color: 'red', marginBottom: '1rem' }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={calculateResult}
                                    style={{
                                        ...buttonStyle,
                                        width: '100%',
                                        marginBottom: '1rem'
                                    }}
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

                                <button
                                    onClick={generateRandomValues}
                                    style={{
                                        ...buttonStyle,
                                        width: '100%',
                                        marginBottom: '1rem'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#cdaafe';
                                        e.currentTarget.style.color = '#3a2d5f';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = '#3a2d5f';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                >
                                    Генерировать
                                </button>
                            </>
                        )}

                        {screen === 'gis' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Определение класса защищенности ГИС</h2>

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
                                    style={{
                                        ...buttonStyle,
                                        width: '100%',
                                        marginBottom: '1rem'
                                    }}
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
                            </>
                        )}
                    </div>

                    {/* Правая колонка с результатами */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: '#2c2c3e',
                        borderRadius: '8px',
                        minHeight: '400px'
                    }}>
                        {screen === 'pd' ? (
                            resultCode ? (
                                <div style={{ textAlign: 'left' }}>
                                    <h3>Результаты расчета:</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong>Уровень угроз:</strong> {resultCode}
                                    </div>
                                    {explanation && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <strong>Пояснение:</strong> {explanation}
                                        </div>
                                    )}

                                    {Object.keys(pdMeasures || {}).length > 0 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <h3>Требуемые меры защиты:</h3>
                                            {Object.entries(pdMeasures).map(([section, items]) => (
                                                <CollapsibleItem key={section} title={section}>
                                                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                                        {items.map((item) => (
                                                            <li key={item.code} style={{ marginBottom: '0.5rem' }}>
                                                                <div style={{ fontWeight: 'bold' }}>{item.code}:</div>
                                                                <div style={{ marginBottom: '0.25rem' }}>{item.text}</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                                    Уровни: {item.levels.join(', ')}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CollapsibleItem>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#999'
                                }}>
                                    <p>Здесь будут отображены результаты расчета</p>
                                </div>
                            )
                        ) : screen === 'gis' ? (
                            gisProtectClass !== null ? (
                                <>
                                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                        <h3>Класс защищенности: {gisProtectClass}</h3>
                                    </div>

                                    {Object.keys(gisMeasures).length > 0 && (
                                        <div style={{ textAlign: 'left' }}>
                                            <h3>Требуемые меры защиты:</h3>
                                            {Object.entries(gisMeasures).map(([section, items]) => (
                                                <CollapsibleItem key={section} title={section}>
                                                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                                        {items.map((item) => (
                                                            <li key={item.code} style={{ marginBottom: '0.5rem' }}>
                                                                <div style={{ fontWeight: 'bold' }}>{item.code}:</div>
                                                                <div style={{ marginBottom: '0.25rem' }}>{item.text}</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                                    Уровни: {item.levels.join(', ')}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CollapsibleItem>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#999'
                                }}>
                                    <p>Здесь будут отображены результаты расчета</p>
                                </div>
                            )
                        ) : null}
                    </div>
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
