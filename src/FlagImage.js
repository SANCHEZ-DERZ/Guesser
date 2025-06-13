import React, { useState, useEffect } from 'react';

// Однопиксельный прозрачный SVG (base64), отображается если все источники недоступны
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIgLz48dGV4dCB4PSIxMCIgeT0iMTA1IiBmb250LXNpemU9IjI0IiBmaWxsPSIjY2NjY2NjIj5GbGFnIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';

// Задержка между попытками загрузки (в миллисекундах)
const RETRY_DELAY = 1000;

// Максимальное количество попыток для каждого URL
const MAX_RETRIES = 2;

/**
 * Компонент, который пытается загрузить флаг из списка url последовательно.
 * При ошибке переходит к следующему источнику с задержкой.
 */
const FlagImage = ({ urls = [], alt = '', className = '' }) => {
  const [index, setIndex] = useState(0);
  const [src, setSrc] = useState(urls[0] || PLACEHOLDER);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState(null);

  useEffect(() => {
    // Если список url изменился — начинаем сначала
    setIndex(0);
    setRetryCount(0);
    setSrc(urls[0] || PLACEHOLDER);
    setLoadStartTime(Date.now());
  }, [urls]);

  const handleError = () => {
    const currentTime = Date.now();
    const timeSinceLastAttempt = currentTime - loadStartTime;

    // Если прошло меньше RETRY_DELAY мс с последней попытки, добавляем задержку
    const shouldDelay = timeSinceLastAttempt < RETRY_DELAY;
    const delay = shouldDelay ? RETRY_DELAY - timeSinceLastAttempt : 0;

    // Проверяем, нужно ли повторить попытку с текущим URL
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setLoadStartTime(Date.now());
        // Перезагружаем тот же URL
        setSrc(urls[index] + '?retry=' + (retryCount + 1));
      }, delay);
      return;
    }

    // Если все попытки исчерпаны, переходим к следующему URL
    if (index + 1 < urls.length) {
      setTimeout(() => {
        const next = index + 1;
        setIndex(next);
        setRetryCount(0);
        setLoadStartTime(Date.now());
        setSrc(urls[next]);
      }, delay);
    } else {
      setSrc(PLACEHOLDER);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default FlagImage; 