import React from 'react';
import MonthPlanner from '../MainPage/MonthPlanner';
import WeekPlanner from './MainPage/WeekPlanner';

// 월별 플래너와 주별 플래너 컴포넌트
const MonthlyPlanner = () => {
  return <div>월별 플래너</div>;
};

const WeeklyPlanner = () => {
  return <div>주별 플래너</div>;
};

const Planner = ({ view }) => {
  return (
    <div>
      {/* 선택된 뷰에 맞는 컴포넌트 렌더링 */}
      {view === 'monthly' ? <MonthPlanner /> : <WeekPlanner />}
    </div>
  );
};

export default Planner;
