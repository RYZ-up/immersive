import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScrambleText = ({ text, delay = 0, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isComplete, setIsComplete] = useState(false);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

  useEffect(() => {
    let iteration = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        });

        iteration += 1 / 2;

        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplayText(text);
          setIsComplete(true);
        }
      }, 20);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, chars]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ marginLeft: '2px' }}
        >
          _
        </motion.span>
      )}
    </motion.span>
  );
};

export default ScrambleText;
