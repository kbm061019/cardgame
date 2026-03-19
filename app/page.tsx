"use client";

import React from 'react';
import { ParabolicCalculator } from '@/components/calculators/ParabolicCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-slate-200/50 dark:border-slate-800/50 py-4 mb-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Physics Lab</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Motion Simulator</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">공식 안내</a>
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">시뮬레이션 가이드</a>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <button className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">분석 도구</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <section className="text-center mb-12 pt-8 animate-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            포물선 운동 <span className="gradient-text">통합 분석 모델</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            임의의 높이와 각도에서의 발사체 궤적을 정밀하게 예측하고,<br/>
            낙하 지점 데이터를 통해 투사체의 초기 속도를 역추적합니다.
          </p>
        </section>

        <div className="animate-in" style={{ animationDelay: '100ms' }}>
          <ParabolicCalculator />
        </div>

        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '200ms' }}>
           <div className="glass-card p-6 border border-slate-200 dark:border-slate-800">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2">정밀한 궤적 예측</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                초기 높이(y₀), 발사 각도(θ), 초기 속도(v₀)를 입력하여 실시간 궤적과 체공 시간을 산출합니다.
              </p>
           </div>
           <div className="glass-card p-6 border border-slate-200 dark:border-slate-800">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-lg font-bold mb-2">지능형 속도 역산</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                실제 측정된 수평 도달 거리(R)를 기반으로 사고 시점이나 발사 시점의 초기 속도를 추적합니다.
              </p>
           </div>
           <div className="glass-card p-6 border border-slate-200 dark:border-slate-800">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2">성능 분석 및 검증</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                역산된 데이터로 다시 시뮬레이션을 실행하여 물리적 타당성을 즉시 검증할 수 있습니다.
              </p>
           </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Physics Lab. Advanced Parabolic Motion Modeling System.
          </p>
        </div>
      </footer>
    </div>
  );
}
