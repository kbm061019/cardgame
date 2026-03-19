"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const ParabolicCalculator = () => {
  const [mode, setMode] = useState<'prediction' | 'inverse'>('prediction');
  const [zoom, setZoom] = useState(1);
  
  // Input states
  const [x0, setX0] = useState('0');
  const [y0, setY0] = useState('5');
  const [targetY, setTargetY] = useState('0');
  const [v0, setV0] = useState('20');
  const [angle, setAngle] = useState('45');
  const [range, setRange] = useState('45.54');

  // Result states
  const [predictionResult, setPredictionResult] = useState<{
    tEnd: number;
    range: number;
    impactV: number;
    impactAngle: number;
    points: { x: number; y: number }[];
  } | null>(null);
  
  const [inverseResult, setInverseResult] = useState<{
    v0: number;
    impactV: number;
    impactAngle: number;
  } | null>(null);

  const g = 9.8;

  const calculatePrediction = () => {
    const x0_val = parseFloat(x0);
    const y0_val = parseFloat(y0);
    const targetY_val = parseFloat(targetY);
    const v0_val = parseFloat(v0);
    const theta_rad = (parseFloat(angle) * Math.PI) / 180;

    if (isNaN(v0_val) || v0_val <= 0) return;

    const v0y = v0_val * Math.sin(theta_rad);
    const v0x = v0_val * Math.cos(theta_rad);

    const discriminant = v0y * v0y - 2 * g * (targetY_val - y0_val);
    
    if (discriminant < 0) {
      alert("해당 조건으로는 목표 높이에 도달할 수 없습니다.");
      return;
    }

    const tEnd = (v0y + Math.sqrt(discriminant)) / g;
    const finalRange = x0_val + v0x * tEnd;

    const vfx = v0x;
    const vfy = v0y - g * tEnd;
    const impactV = Math.sqrt(vfx * vfx + vfy * vfy);
    const impactAngle = (Math.atan2(vfy, vfx) * 180) / Math.PI;

    const points = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = (tEnd * i) / steps;
      const x = x0_val + v0x * t;
      const y = y0_val + v0y * t - 0.5 * g * t * t;
      points.push({ x, y: Math.max(Math.min(y0_val, targetY_val, 0) - 5, y) });
    }

    setPredictionResult({ tEnd, range: finalRange, impactV, impactAngle, points });
  };

  const calculateInverse = () => {
    const r_val = parseFloat(range);
    const x0_val = parseFloat(x0);
    const y0_val = parseFloat(y0);
    const targetY_val = parseFloat(targetY);
    const theta_rad = (parseFloat(angle) * Math.PI) / 180;

    if (isNaN(r_val) || r_val <= x0_val) return;

    const dx = r_val - x0_val;
    const dy = targetY_val - y0_val;
    const cosTheta = Math.cos(theta_rad);
    const tanTheta = Math.tan(theta_rad);

    const denom = 2 * (dx * tanTheta - dy);
    if (denom <= 0) {
      alert("해당 각도로는 목표 지점에 도달할 수 없습니다. (각도를 높이거나 거리를 조절하세요)");
      return;
    }

    const calculatedV0 = (dx / cosTheta) * Math.sqrt(g / denom);
    
    const tEnd = dx / (calculatedV0 * cosTheta);
    const vfx = calculatedV0 * cosTheta;
    const vfy = calculatedV0 * Math.sin(theta_rad) - g * tEnd;
    const impactV = Math.sqrt(vfx * vfx + vfy * vfy);
    const impactAngle = (Math.atan2(vfy, vfx) * 180) / Math.PI;

    setInverseResult({ v0: calculatedV0, impactV, impactAngle });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex flex-col">
            <span>포물선 운동 통합 모델</span>
            <span className="text-[10px] font-normal text-zinc-500 uppercase tracking-widest mt-1">Multi-Point Simulation & Recovery</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={mode === 'prediction' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setMode('prediction')}
              className="text-xs h-8 px-3"
            >
              궤적 예측
            </Button>
            <Button 
              variant={mode === 'inverse' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setMode('inverse')}
              className="text-xs h-8 px-3"
            >
              속도 역산
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase">발사 조건 (Start)</h4>
            <Input label="초기 높이 y₀ (m)" type="number" value={y0} onChange={(e) => setY0(e.target.value)} />
            <Input label="초기 위치 x₀ (m)" type="number" value={x0} onChange={(e) => setX0(e.target.value)} />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase">목표 조건 (Target)</h4>
            <Input label="도달 높이 y_target (m)" type="number" value={targetY} className="border-blue-100 dark:border-blue-900 focus:ring-blue-400" placeholder="0 (지면)" onChange={(e) => setTargetY(e.target.value)} />
            {mode === 'inverse' ? (
              <Input label="도달 거리 R (m)" type="number" value={range} onChange={(e) => setRange(e.target.value)} />
            ) : (
              <Input label="초기 속도 v₀ (m/s)" type="number" value={v0} onChange={(e) => setV0(e.target.value)} />
            )}
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase">물리 파라미터</h4>
            <Input label="발사 각도 θ (°)" type="number" value={angle} onChange={(e) => setAngle(e.target.value)} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-zinc-400 ml-1">중력 가속도 g</label>
              <div className="h-11 flex items-center px-4 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 text-sm text-zinc-500">9.8 m/s² (표준)</div>
            </div>
          </div>
        </div>

        <Button onClick={mode === 'prediction' ? calculatePrediction : calculateInverse} className="w-full h-12 text-lg font-bold shadow-lg">
          {mode === 'prediction' ? '실시간 궤적 시뮬레이션' : '데이터 기반 속도 역산'}
        </Button>

        {mode === 'prediction' && predictionResult && (
          <div className="mt-6 space-y-6 animate-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">체공 시간</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{predictionResult.tEnd.toFixed(2)}s</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">최종 도달 거리</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{predictionResult.range.toFixed(2)}m</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase">충돌 속도</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{predictionResult.impactV.toFixed(2)}m/s</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-[10px] text-zinc-500 font-bold uppercase">충돌 각도</p>
                <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">{predictionResult.impactAngle.toFixed(1)}°</p>
              </div>
            </div>

            <div className="relative h-80 w-full bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
               <div className="absolute top-3 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                 <div className="flex flex-col gap-1">
                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">궤적 시뮬레이션</div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-0.5 bg-blue-500"></div>
                      <span className="text-[9px] text-zinc-500">예상 경로 ({y0}m → {targetY}m)</span>
                   </div>
                 </div>
                 
                 <div className="flex gap-1 pointer-events-auto">
                    <button onClick={() => setZoom(prev => Math.max(1, prev - 0.2))} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm hover:bg-zinc-50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <div className="flex items-center justify-center px-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[9px] font-bold min-w-[32px]">{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(prev => Math.min(3, prev + 0.2))} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm hover:bg-zinc-50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                 </div>
               </div>

               <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                  {predictionResult.points.length > 0 && (
                    <div className="relative w-[90%] h-[80%] transition-transform duration-200 flex items-end" style={{ transform: `scale(${zoom})`, transformOrigin: 'center bottom' }}>
                      <svg className="w-full h-full overflow-visible" viewBox={`${parseFloat(x0) - 2} ${Math.min(parseFloat(y0), parseFloat(targetY), 0) - 2} ${predictionResult.range - parseFloat(x0) + 4} ${Math.max(...predictionResult.points.map(p => p.y), 0) - Math.min(parseFloat(y0), parseFloat(targetY), 0) + 6}`} preserveAspectRatio="xMidYMax meet">
                        <g transform={`scale(1, -1) translate(0, -${Math.max(...predictionResult.points.map(p => p.y), 0) + 2})`}>
                          <line x1={parseFloat(x0) - 10} y1="0" x2={predictionResult.range + 10} y2="0" stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
                          {parseFloat(y0) > 0 && <line x1={x0} y1="0" x2={x0} y2={y0} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-zinc-400 opacity-50" />}
                          {parseFloat(targetY) > 0 && <line x1={predictionResult.range} y1="0" x2={predictionResult.range} y2={targetY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-zinc-400 opacity-50" />}
                          <line x1={x0} y1={targetY} x2={predictionResult.range} y2={targetY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="text-blue-200 dark:text-blue-900" />
                          <path d={`M ${predictionResult.points.map(p => `${p.x},${p.y}`).join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-blue-500" />
                        </g>
                      </svg>
                    </div>
                  )}
               </div>
               
               <div className="absolute bottom-2 left-0 right-0 px-6 flex justify-between z-10 pointer-events-none">
                 <span className="text-[10px] font-medium text-zinc-400">{x0}m</span>
                 <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-zinc-900/80 px-1 rounded backdrop-blur-sm">{predictionResult.range.toFixed(2)}m</span>
               </div>
               <div className="h-6 bg-zinc-100/50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest">Physics Lab Precise Calculation Engine</span>
               </div>
            </div>
          </div>
        )}

        {mode === 'inverse' && inverseResult && (
          <div className="mt-6 space-y-6 animate-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase mb-2">추정 초기 속도 (v₀)</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-black text-orange-700 dark:text-orange-300">{inverseResult.v0.toFixed(3)}</span>
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-3">m/s</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                   <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <span className="text-xs text-zinc-500 font-medium">충돌 시 속도 (v_impact)</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{inverseResult.impactV.toFixed(2)} m/s</span>
                   </div>
                   <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <span className="text-xs text-zinc-500 font-medium">충돌 시 각도 (θ_impact)</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{inverseResult.impactAngle.toFixed(1)}°</span>
                   </div>
                </div>
             </div>
             
             <div className="p-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-xs text-blue-100 font-medium italic opacity-80">"사고 시뮬레이션 검증 준비 완료"</p>
                      <h5 className="font-bold text-sm">입력된 조건으로 궤적 시퀀스 생성</h5>
                   </div>
                   <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" size="sm" onClick={() => { setV0(inverseResult.v0.toFixed(3)); setMode('prediction'); setTimeout(calculatePrediction, 0); }}>궤적 검증 실행</Button>
                </div>
             </div>
          </div>
        )}

        <div className="mt-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
           <h4 className="font-bold mb-1 text-zinc-700 dark:text-zinc-300">물리 공식 가이드</h4>
           <p>• Forward: x(t) = x₀ + v₀cosθt, y(t) = y₀ + v₀sinθt - ½gt²</p>
           <p>• Inverse: v₀ = (R-x₀)/cosθ * sqrt(g / (2 * ((R-x₀)tanθ + (y₀ - y_target))))</p>
        </div>
      </CardContent>
    </Card>
  );
};
