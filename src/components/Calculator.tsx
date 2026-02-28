import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, History, Settings, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface CalculatorProps {
  onUnlock: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onUnlock }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [memory, setMemory] = useState(0);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    if (display === '20482048') {
      onUnlock();
    }
    setDisplay('0');
    setEquation('');
  };

  const handleEqual = () => {
    try {
      let result: number;
      const fullEquation = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');
      
      // Basic sanitization: only allow numbers, operators, Math functions, and parentheses
      // This is still using eval for simplicity in this demo environment
      const sanitized = fullEquation.replace(/[a-zA-Z]+/g, (match) => {
        if (['Math', 'sin', 'cos', 'tan', 'log', 'log10', 'PI', 'E', 'sqrt', 'pow', 'abs'].includes(match)) {
          return match.startsWith('Math.') ? match : `Math.${match}`;
        }
        return match;
      });

      // Handle specific scientific function names that might not be in Math. directly
      const finalExpr = sanitized
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      result = Function(`"use strict"; return (${finalExpr})`)();
      setDisplay(String(Number(result.toFixed(8))));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleScientific = (func: string) => {
    if (func === 'sqrt') setDisplay(Math.sqrt(parseFloat(display)).toString());
    else if (func === 'sq') setDisplay((parseFloat(display) ** 2).toString());
    else if (func === 'sin') setDisplay(Math.sin(parseFloat(display)).toString());
    else if (func === 'cos') setDisplay(Math.cos(parseFloat(display)).toString());
    else if (func === 'tan') setDisplay(Math.tan(parseFloat(display)).toString());
    else if (func === 'log') setDisplay(Math.log10(parseFloat(display)).toString());
    else if (func === 'ln') setDisplay(Math.log(parseFloat(display)).toString());
  };

  const buttons = [
    ['MC', 'MR', 'M+', 'M-', 'MS'],
    ['2nd', 'π', 'e', 'C', '⌫'],
    ['x²', '1/x', '|x|', 'exp', 'mod'],
    ['√', '(', ')', 'n!', '÷'],
    ['xʸ', '7', '8', '9', '×'],
    ['10ˣ', '4', '5', '6', '-'],
    ['log', '1', '2', '3', '+'],
    ['ln', '+/-', '0', '.', '=']
  ];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-800"
      >
        <div className="p-6 bg-zinc-900/50">
          <div className="text-zinc-500 text-right h-6 text-sm mb-1 overflow-hidden">
            {equation}
          </div>
          <div className="text-white text-right text-5xl font-light tracking-tighter truncate">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-800/20">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (/\d/.test(btn)) handleNumber(btn);
                else if (['+', '-', '×', '÷'].includes(btn)) handleOperator(btn.replace('×', '*').replace('÷', '/'));
                else if (btn === '=') handleEqual();
                else if (btn === 'C') handleClear();
                else if (btn === '.') handleNumber('.');
                else if (btn === 'π') handleNumber('π');
                else if (btn === 'e') handleNumber('e');
                else if (btn === 'MC') setMemory(0);
                else if (btn === 'MR') setDisplay(memory.toString());
                else if (btn === 'M+') setMemory(prev => prev + parseFloat(display));
                else if (btn === 'M-') setMemory(prev => prev - parseFloat(display));
                else if (btn === 'MS') setMemory(parseFloat(display));
                else if (['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', '1/x', '|x|', 'exp', 'mod', 'n!', 'xʸ', '10ˣ', '+/-'].includes(btn)) {
                   if (btn === '1/x') setDisplay(prev => (1 / parseFloat(prev)).toString());
                   else if (btn === '|x|') setDisplay(prev => Math.abs(parseFloat(prev)).toString());
                   else if (btn === 'exp') setDisplay(prev => Math.exp(parseFloat(prev)).toString());
                   else if (btn === 'mod') handleOperator('%');
                   else if (btn === '+/-') setDisplay(prev => (parseFloat(prev) * -1).toString());
                   else if (btn === '10ˣ') setDisplay(prev => (10 ** parseFloat(prev)).toString());
                   else if (btn === 'xʸ') handleOperator('^');
                   else if (btn === 'n!') {
                      const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
                      setDisplay(prev => fact(parseInt(prev)).toString());
                   }
                   else {
                     const map: any = { '√': 'sqrt', 'x²': 'sq' };
                     handleScientific(map[btn] || btn);
                   }
                }
                else if (btn === '⌫') setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
              }}
              className={`
                h-14 text-sm font-medium transition-all active:scale-95
                ${/\d/.test(btn) ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 
                  btn === '=' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
                  'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}
                rounded-lg
              `}
            >
              {btn}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
