import { Trophy, TrendingDown, TrendingUp, Clock, Calendar, Target } from 'lucide-react';
import { useState } from 'react';

export interface SwimEvent {
  id: string;
  event: string;
  distance: string;
  stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'IM';
  recentTime: string;
  recentDate: string;
  personalBest: string;
  pbDate: string;
  improvement?: number; // percentage improvement (negative means slower)
}

interface SwimTimesProps {
  studentEmail: string;
}

// Mock data - replace with real database data
const SWIM_TIMES: Record<string, SwimEvent[]> = {
  'competitive@proswim.lb': [
    {
      id: '1',
      event: '50m Freestyle',
      distance: '50m',
      stroke: 'Freestyle',
      recentTime: '00:26.84',
      recentDate: '2025-01-02',
      personalBest: '00:26.34',
      pbDate: '2024-12-15',
      improvement: -1.9 // 1.9% slower than PB
    },
    {
      id: '2',
      event: '100m Freestyle',
      distance: '100m',
      stroke: 'Freestyle',
      recentTime: '00:58.12',
      recentDate: '2025-01-02',
      personalBest: '00:57.23',
      pbDate: '2024-12-20',
      improvement: -1.6
    },
    {
      id: '3',
      event: '50m Backstroke',
      distance: '50m',
      stroke: 'Backstroke',
      recentTime: '00:32.45',
      recentDate: '2024-12-28',
      personalBest: '00:31.89',
      pbDate: '2024-12-28',
      improvement: 0 // This IS the PB
    },
    {
      id: '4',
      event: '100m Backstroke',
      distance: '100m',
      stroke: 'Backstroke',
      recentTime: '01:09.76',
      recentDate: '2024-12-28',
      personalBest: '01:08.34',
      pbDate: '2024-11-10',
      improvement: -2.1
    },
    {
      id: '5',
      event: '50m Butterfly',
      distance: '50m',
      stroke: 'Butterfly',
      recentTime: '00:30.23',
      recentDate: '2024-12-30',
      personalBest: '00:30.23',
      pbDate: '2024-12-30',
      improvement: 0 // This IS the PB
    },
    {
      id: '6',
      event: '100m Butterfly',
      distance: '100m',
      stroke: 'Butterfly',
      recentTime: '01:08.91',
      recentDate: '2024-12-30',
      personalBest: '01:07.45',
      pbDate: '2024-11-25',
      improvement: -2.2
    },
    {
      id: '7',
      event: '100m Breaststroke',
      distance: '100m',
      stroke: 'Breaststroke',
      recentTime: '01:15.34',
      recentDate: '2024-12-22',
      personalBest: '01:14.12',
      pbDate: '2024-12-01',
      improvement: -1.6
    },
    {
      id: '8',
      event: '200m IM',
      distance: '200m',
      stroke: 'IM',
      recentTime: '02:28.56',
      recentDate: '2024-12-20',
      personalBest: '02:26.78',
      pbDate: '2024-11-30',
      improvement: -1.2
    }
  ],
  'sanadalaghbar@gmail.com': [
    {
      id: '1',
      event: '25m Freestyle',
      distance: '25m',
      stroke: 'Freestyle',
      recentTime: '00:18.45',
      recentDate: '2025-01-02',
      personalBest: '00:18.45',
      pbDate: '2025-01-02',
      improvement: 0
    },
    {
      id: '2',
      event: '25m Backstroke',
      distance: '25m',
      stroke: 'Backstroke',
      recentTime: '00:22.12',
      recentDate: '2024-12-28',
      personalBest: '00:21.89',
      pbDate: '2024-11-15',
      improvement: -1.1
    }
  ]
};

export function SwimTimes({ studentEmail }: SwimTimesProps) {
  const [selectedStroke, setSelectedStroke] = useState<string>('all');
  const swimTimes = SWIM_TIMES[studentEmail] || [];

  const filteredTimes = selectedStroke === 'all' 
    ? swimTimes 
    : swimTimes.filter(time => time.stroke === selectedStroke);

  const strokes = ['all', ...Array.from(new Set(swimTimes.map(t => t.stroke)))];

  const totalPBs = swimTimes.filter(t => t.improvement === 0).length;
  const avgImprovement = swimTimes.length > 0
    ? swimTimes.reduce((sum, t) => sum + (t.improvement || 0), 0) / swimTimes.length
    : 0;

  if (swimTimes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
        <Clock className="size-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No swim times recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          icon={<Trophy className="size-5 text-yellow-600" />}
          value={totalPBs.toString()}
          label="Recent PBs"
          color="yellow"
        />
        <StatCard 
          icon={<Target className="size-5 text-blue-600" />}
          value={swimTimes.length.toString()}
          label="Events"
          color="blue"
        />
        <StatCard 
          icon={avgImprovement >= 0 ? <TrendingUp className="size-5 text-green-600" /> : <TrendingDown className="size-5 text-red-600" />}
          value={avgImprovement >= 0 ? `${avgImprovement.toFixed(1)}%` : `${Math.abs(avgImprovement).toFixed(1)}%`}
          label="Avg Gap"
          color={avgImprovement >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Filter by Stroke */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {strokes.map(stroke => (
          <button
            key={stroke}
            onClick={() => setSelectedStroke(stroke)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
              selectedStroke === stroke
                ? 'bg-[#0B4F8C] dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95'
            }`}
          >
            {stroke === 'all' ? 'All Strokes' : stroke}
          </button>
        ))}
      </div>

      {/* Swim Times List */}
      <div className="space-y-3">
        {filteredTimes.map(swim => (
          <SwimTimeCard key={swim.id} swim={swim} />
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'yellow' | 'blue' | 'green' | 'red';
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 text-center border`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg text-gray-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

interface SwimTimeCardProps {
  swim: SwimEvent;
}

function SwimTimeCard({ swim }: SwimTimeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isPB = swim.improvement === 0;
  const isImprovement = (swim.improvement || 0) > 0;
  const timeDiff = calculateTimeDifference(swim.recentTime, swim.personalBest);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div 
        className="p-4 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base text-gray-900 dark:text-white">{swim.event}</h3>
              {isPB && (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Trophy className="size-3" />
                  PB
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{swim.stroke} • {swim.distance}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recent Time</div>
            <div className="text-2xl text-gray-900 dark:text-white tabular-nums">{swim.recentTime}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(swim.recentDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Personal Best</div>
            <div className="text-2xl text-blue-600 dark:text-blue-400 tabular-nums">{swim.personalBest}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(swim.pbDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {!isPB && (
          <div className={`mt-3 p-2 rounded-lg ${
            isImprovement 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className={isImprovement ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}>
                {isImprovement ? 'Faster than PB' : 'Behind PB'}
              </span>
              <span className={`flex items-center gap-1 ${isImprovement ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                {isImprovement ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                +{timeDiff}
              </span>
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difference</div>
              <div className="text-base text-gray-900 dark:text-white">+{timeDiff}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gap %</div>
              <div className="text-base text-gray-900 dark:text-white">
                {Math.abs(swim.improvement || 0).toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm active:scale-95 transition-transform">
              View Full History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateTimeDifference(recentTime: string, pbTime: string): string {
  const parseTime = (time: string): number => {
    const parts = time.split(':');
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return parseFloat(minutes) * 60 + parseFloat(seconds);
    }
    return parseFloat(time);
  };

  const recent = parseTime(recentTime);
  const pb = parseTime(pbTime);
  const diff = Math.abs(recent - pb);

  const minutes = Math.floor(diff / 60);
  const seconds = (diff % 60).toFixed(2);

  if (minutes > 0) {
    return `${minutes}:${seconds.padStart(5, '0')}`;
  }
  return seconds;
}
