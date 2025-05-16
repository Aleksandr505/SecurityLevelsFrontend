import React, { useState } from 'react';

function App() {
  // Состояния для выбора категорий ПД, количества субъектов, пояснения, ошибки и сертификаций
  const [pdType, setPdType] = useState([]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [resultCode, setResultCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [certOs, setCertOs] = useState('');
  const [certApp, setCertApp] = useState('');

  // Список категорий персональных данных
  const categories = [
    'Общедоступные',
    'Специальные категории',
    'Биометрические',
    'Иные'
  ];

  // Функция отправки данных на сервер для расчета уровня угроз
  const calculateResult = async () => {
    if (pdType.length && employeeCount && certOs && certApp) {
      try {
        // Очистка предыдущих ошибок и результатов
        setError('');
        setExplanation('');
        setResultCode('');

        // Отправка POST-запроса на backend
        const response = await fetch('http://localhost:8080/api/level', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            certOs,
            certApp,
            network: "network",
            number: employeeCount,
            selectedOptions: pdType
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.reason || `Ошибка сервера: ${response.status}`);
        }

        // Установка результата и пояснения
        setResultCode(data.maxLevel);
        setExplanation(data.reason);
      } catch (e) {
        setError(e.message || 'Ошибка при отправке запроса');
      }
    } else {
      setError('Пожалуйста, заполните все поля');
    }
  };

  // Функция переключения выбора категории ПДн (мультиселект)
  const toggleCategory = (category) => {
    setPdType(prev =>
        prev.includes(category)
            ? prev.filter(c => c !== category)   // удаление, если уже выбрано
            : [...prev, category]    // добавление в список
    );
  };

  return (
      <div style={{
        display: 'flex',
        padding: '2rem 6rem',
        fontFamily: 'sans-serif',
        backgroundColor: '#1e1e1e',
        color: 'white',
        minHeight: '100vh',
        marginTop: '1rem'
      }}>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <h1 style={{ marginBottom: '2rem' }}>Проверка уровня угроз</h1>

          <div style={{ marginBottom: '2rem' }}>
            <label>Тип персональных данных:</label><br />
            <div style={{ marginTop: '0.5rem' }}>
              {categories.map(category => (
                  <label key={category} style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        value={category}
                        checked={pdType.includes(category)}
                        onChange={() => toggleCategory(category)}
                        style={{ marginRight: '0.5rem' }}
                    />
                    {category}
                  </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>Количество субъектов:</label><br />
            <select
                value={employeeCount}
                onChange={e => setEmployeeCount(e.target.value)}
                style={{ padding: '0.8rem', width: '100%', marginTop: '0.5rem' }}
            >
              <option value="">— выберите —</option>
              <option value="lt">До 100 тыс.</option>
              <option value="gt">Более 100 тыс.</option>
            </select>
          </div>

          <div style={{marginBottom: '2rem'}}>
            <label>Сертификация ОС:</label><br/>
            <select
                value={certOs}
                onChange={e => setCertOs(e.target.value)}
                style={{padding: '0.8rem', width: '100%', marginTop: '0.5rem'}}
            >
              <option value="">— выберите —</option>
              <option value="certified">Сертифицирована</option>
              <option value="not_certified">Не сертифицирована</option>
            </select>
          </div>

          <div style={{marginBottom: '2rem'}}>
            <label>Сертификация приложения:</label><br/>
            <select
                value={certApp}
                onChange={e => setCertApp(e.target.value)}
                style={{padding: '0.8rem', width: '100%', marginTop: '0.5rem'}}
            >
              <option value="">— выберите —</option>
              <option value="certified">Сертифицировано</option>
              <option value="not_certified">Не сертифицировано</option>
            </select>
          </div>

          <button
              onClick={calculateResult}
              style={{padding: '0.8rem 1.5rem', fontSize: '1rem', marginTop: '1rem'}}
          >
            Рассчитать
          </button>

          {error && (
              <div style={{color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>
                {error}
              </div>
          )}

          {resultCode && (
              <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Уровень угрозы: {resultCode}
              </div>
          )}
        </div>

        {resultCode && explanation && (
            <div style={{
              flex: 1,
              marginLeft: '4rem',
              padding: '1rem',
              backgroundColor: '#333',
              borderRadius: '12px',
              alignSelf: 'flex-start',
              marginTop: '3.5rem',
              maxWidth: '500px'
            }}>
              <h2 style={{ marginBottom: '1rem' }}>Пояснение</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                <strong>{resultCode}:</strong> {explanation}
              </p>
            </div>
        )}
      </div>
  );
}

export default App;
