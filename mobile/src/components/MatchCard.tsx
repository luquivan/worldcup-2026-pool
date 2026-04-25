import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Match, Prediction } from '@prode/shared';
import { savePrediction, canPredict } from '../services/predictionService';

const FIFA_TO_ISO2: Record<string, string> = {
  ARG: 'AR', BRA: 'BR', URU: 'UY', COL: 'CO', ECU: 'EC', CHI: 'CL',
  PER: 'PE', PAR: 'PY', BOL: 'BO', VEN: 'VE',
  USA: 'US', CAN: 'CA', MEX: 'MX', CRC: 'CR', HON: 'HN',
  JAM: 'JM', PAN: 'PA', TTO: 'TT',
  FRA: 'FR', GER: 'DE', ESP: 'ES', ENG: 'GB', POR: 'PT',
  NED: 'NL', BEL: 'BE', ITA: 'IT', CRO: 'HR', SUI: 'CH',
  DEN: 'DK', POL: 'PL', SRB: 'RS', AUT: 'AT', SWE: 'SE',
  NOR: 'NO', TUR: 'TR', GRE: 'GR', UKR: 'UA', ROU: 'RO',
  HUN: 'HU', SVK: 'SK', CZE: 'CZ', ALB: 'AL', SLO: 'SI',
  GEO: 'GE', SCO: 'GB', WAL: 'GB',
  MAR: 'MA', SEN: 'SN', NGA: 'NG', EGY: 'EG', CMR: 'CM',
  CIV: 'CI', GHA: 'GH', TUN: 'TN', ALG: 'DZ', MLI: 'ML',
  JPN: 'JP', KOR: 'KR', IRN: 'IR', SAU: 'SA', AUS: 'AU',
  QAT: 'QA', IRQ: 'IQ', JOR: 'JO', UAE: 'AE', NZL: 'NZ',
};

const toFlagEmoji = (code: string): string => {
  const iso2 = FIFA_TO_ISO2[code] ?? 'XX';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
};

interface Props {
  match: Match;
  userId?: string;
  prediction?: Prediction;
}

export const MatchCard: React.FC<Props> = ({ match, userId, prediction }) => {
  const [home, setHome] = useState(prediction?.homePrediction?.toString() ?? '');
  const [away, setAway] = useState(prediction?.awayPrediction?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHome(prediction.homePrediction?.toString() ?? '');
      setAway(prediction.awayPrediction?.toString() ?? '');
    }
  }, [prediction]);

  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
  const open = canPredict(match.timestamp);
  const editable = !!userId && open && !isPlayed;

  const save = async () => {
    if (!editable || !userId) return;
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaving(true);
    try {
      await savePrediction(userId, String(match.game), h, a);
    } finally {
      setSaving(false);
    }
  };

  const onBlur = () => {
    if (home !== '' && away !== '') save();
  };

  const isLive =
    !isPlayed &&
    Date.now() >= match.timestamp * 1000 &&
    Date.now() < match.timestamp * 1000 + 150 * 60 * 1000;

  const showPoints = isPlayed && prediction;
  const pts = prediction?.points ?? 0;

  const time = new Date(match.date).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      {/* Main row */}
      <View style={styles.row}>
        {/* Teams */}
        <View style={styles.teams}>
          {/* Home */}
          <View style={styles.teamRow}>
            <Text style={styles.flag}>{toFlagEmoji(match.home)}</Text>
            <Text style={styles.teamName} numberOfLines={1}>{match.homeName}</Text>
            <Text style={styles.score}>
              {isPlayed ? match.homeScore : '–'}
            </Text>
            {editable ? (
              <TextInput
                style={styles.input}
                value={home}
                onChangeText={v => setHome(v.replace(/\D/g, '').slice(0, 2))}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="–"
                placeholderTextColor="#475569"
                editable={!saving}
                selectTextOnFocus
              />
            ) : prediction ? (
              <View style={styles.predBox}>
                <Text style={styles.predText}>{prediction.homePrediction}</Text>
              </View>
            ) : null}
          </View>

          {/* Away */}
          <View style={styles.teamRow}>
            <Text style={styles.flag}>{toFlagEmoji(match.away)}</Text>
            <Text style={styles.teamName} numberOfLines={1}>{match.awayName}</Text>
            <Text style={styles.score}>
              {isPlayed ? match.awayScore : '–'}
            </Text>
            {editable ? (
              <TextInput
                style={styles.input}
                value={away}
                onChangeText={v => setAway(v.replace(/\D/g, '').slice(0, 2))}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="–"
                placeholderTextColor="#475569"
                editable={!saving}
                selectTextOnFocus
              />
            ) : prediction ? (
              <View style={styles.predBox}>
                <Text style={styles.predText}>{prediction.awayPrediction}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Points badge */}
        {showPoints && (
          <View style={[styles.pointsBadge, pts > 0 ? styles.badgeGreen : styles.badgeRed]}>
            <Text style={styles.pointsEmoji}>
              {pts === 15 ? '🥳' : pts > 0 ? '😄' : '😔'}
            </Text>
            <Text style={styles.pointsText}>
              {pts > 0 ? `+${pts}` : pts} pts
            </Text>
          </View>
        )}

        {saving && <ActivityIndicator size="small" color="#22c55e" style={{ marginLeft: 8 }} />}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {match.group && <Text style={styles.meta}>Grupo {match.group} · </Text>}
        <Text style={styles.meta}>{match.locationCity} · {time}</Text>
        {isLive && <Text style={styles.live}> 🔴 EN VIVO</Text>}
        {!open && !isPlayed && <Text style={styles.closed}> · Cerrado</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  teams: { flex: 1 },
  teamRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  flag: { fontSize: 22, width: 32 },
  teamName: { flex: 1, color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  score: { color: '#fff', fontSize: 18, fontWeight: 'bold', width: 28, textAlign: 'center' },
  input: {
    width: 36, height: 32, backgroundColor: '#0f172a', color: '#fff',
    borderRadius: 6, borderWidth: 1, borderColor: '#475569',
    textAlign: 'center', fontSize: 16, fontWeight: 'bold',
  },
  predBox: {
    width: 36, height: 32, backgroundColor: '#1e3a5f', borderRadius: 6,
    borderWidth: 1, borderColor: '#3b82f6', justifyContent: 'center', alignItems: 'center',
  },
  predText: { color: '#93c5fd', fontSize: 16, fontWeight: 'bold' },
  pointsBadge: {
    width: 52, borderRadius: 8, alignItems: 'center',
    paddingVertical: 6, marginLeft: 10,
  },
  badgeGreen: { backgroundColor: '#14532d' },
  badgeRed: { backgroundColor: '#7f1d1d' },
  pointsEmoji: { fontSize: 20, marginBottom: 2 },
  pointsText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  footer: { flexDirection: 'row', marginTop: 2, flexWrap: 'wrap' },
  meta: { color: '#64748b', fontSize: 12 },
  live: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  closed: { color: '#64748b', fontSize: 12 },
});
