import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Job } from '../../lib/types';
import { api } from '../../services/api';

// This screen shows a week strip at the top for quick navigation between days, and a list of jobs for the selected day.
// It fetches only upcoming jobs to populate the week strip with indicators of which days have jobs.
// Users can tap on a day in the strip to view jobs for that day, and tap on a job to see details.
function buildWeekStrip(): Date[] {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    for (let i = -3; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
}

function toDateKey(d: Date): string {
    return d.toISOString().slice(0,10); // YYYY-MM-DD
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MyScheduleScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Week Strip constants
    const stripDays = buildWeekStrip();
    const todayKey = toDateKey(new Date());

    const [selectedDate, setSelectedDate] = useState<string>(todayKey);
    const stripRef = useRef<ScrollView>(null);

    const jobCountByDate = jobs.reduce<Record<string, number>>((acc, j) => {
        acc[j.job_date] = (acc[j.job_date] ?? 0) + 1;
        return acc;
    }, {});

    const fetchJobs = useCallback(async () => {
        try {
            // axios turns the params object into ?upcoming=true for you
            const res = await api.get('/drivers/me/jobs/', { params: { upcoming: true } });
            setJobs(res.data);
            setError(null); // Clear any previous errors
        } catch (err: any) {
            setError(err.message ?? 'Failed to load schedule.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    // Scroll to today's date on mount
    useEffect(() => {
        const todayIndex = 3
        const pillWidth = 64;
        setTimeout(() => {
            stripRef.current?.scrollTo({ x: todayIndex * pillWidth - 80, animated: false});
        }, 0);
    }, []);

    const dayJobs = jobs.filter(j => j.job_date === selectedDate);


    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

            {/* Loading */}
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={{ marginTop: 60 }}
                />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="wifi-off" size={32} color={theme.colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchJobs}>
                        <Text style={styles.retryText}>Tap to retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Week Strip */}
                    <View style={styles.stripWrapper}>
                        <ScrollView
                            ref={stripRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.stripContent}
                        >
                            {stripDays.map((day) => {
                                const key = toDateKey(day);
                                const isToday = key === todayKey;
                                const isSelected = key === selectedDate;
                                const hasJobs = (jobCountByDate[key] ?? 0) > 0;

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.pill,
                                            isToday && styles.pillToday,
                                            isSelected && styles.pillSelected,
                                        ]}
                                        onPress={() => setSelectedDate(key)}
                                    >
                                        <Text style={[styles.pillDay, isSelected && styles.pillTextSelected]}>
                                            {DAY_NAMES[day.getDay()]}
                                        </Text>
                                        <Text style={[styles.pillDate, isSelected && styles.pillTextSelected]}>
                                            {day.getDate()}
                                        </Text>
                                        {hasJobs && (
                                            <View style={[styles.dot, isSelected && styles.dotSelected]} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Day Job List */}
                    <FlatList
                        data={dayJobs}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push({ pathname: '/job/[id]', params: { id: item.id } })}
                            >
                                <Text style={styles.jobNumber}>{item.job_number}</Text>
                                <Text style={styles.project}>{item.project}</Text>
                                <Text style={styles.detail}>{item.shift_start} · {item.material}</Text>
                                <Text style={styles.detail}>{item.loading_address_info.city}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="event-available" size={32} color={theme.colors.textTertiary} />
                                <Text style={styles.emptyText}>No jobs on this day</Text>
                            </View>
                        }
                    />
                </>
            )}
        </View>
    );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
    return StyleSheet.create({
    stripWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    stripContent: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    pill: {
        width: 56,
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        gap: 2,
    },
    pillToday: {
        backgroundColor: theme.colors.primary + '20', // 20 for transparency
    },
    pillSelected: {
        backgroundColor: theme.colors.primary,
    },
    pillDay: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    pillDate: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.bold,
    },
    pillTextSelected: {
        color: theme.colors.textInverse,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
        marginTop: 2,
    },
    dotSelected: {
        backgroundColor: theme.colors.textInverse,
    },
    listContent: {
        padding: theme.spacing.md,
        gap: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    jobNumber: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
    project: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    detail: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: theme.spacing.sm,
    },
    emptyText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textTertiary,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    errorText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    retryText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
});
}
