import React, { useState } from 'react';

// 월별 플래너와 주별 플래너 컴포넌트
const MonthlyPlanner = () => {
  return <div>월별 플래너</div>;
};

const WeeklyPlanner = () => {
  return <div>주별 플래너</div>;
};

const Planner = () => {
  // 현재 플래너 뷰 상태 (월별 또는 주별)
  const [view, setView] = useState('monthly'); // 기본값은 월별 플래너

  // 플래너 뷰 변경 함수
  const handleChangeView = (e) => {
    setView(e.target.value);
  };

  return (
    <div>
      {/* 설정 UI: 월별/주별 선택 */}
      <div>
        <label>
          <input
            type="radio"
            value="monthly"
            checked={view === 'monthly'}
            onChange={handleChangeView}
          />
          월별 플래너
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="weekly"
            checked={view === 'weekly'}
            onChange={handleChangeView}
          />
          주별 플래너
        </label>
      </div>

      {/* 선택된 뷰에 맞는 컴포넌트 렌더링 */}
      <div>
        {view === 'monthly' ? <MonthlyPlanner /> : <WeeklyPlanner />}
      </div>
    </div>
  );
};

export default Planner;
