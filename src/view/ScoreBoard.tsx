import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { ScoreBoard as ScoreBoardType } from '../types/ScoreBoard'

type ScoreBoardProps = {
    scoreBoard: ScoreBoardType
    onDismiss: () => void
}

export function ScoreBoard({ scoreBoard, onDismiss }: ScoreBoardProps) {
    const scoreBoardEntries = Object.entries(scoreBoard)

    return (
        <SafeAreaView
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                position: 'absolute',
                height: '100%',
                width: '100%',
            }}
        >
            <View
                style={{
                    alignItems: 'center',
                    flex: 1,
                    padding: 20,
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 24,
                        marginBottom: 24,
                    }}
                >
                    Scores
                </Text>
                <View
                    style={{
                        width: '100%',
                        gap: 12,
                        flex: 1,
                    }}
                >
                    {scoreBoardEntries.map(([name, score]) => (
                        <ScoreBoardRow key={name} name={name} score={score} />
                    ))}
                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                    }}
                    onPress={onDismiss}
                    aria-label="Dismiss"
                >
                    <Text
                        aria-hidden
                        style={{
                            fontSize: 20,
                            fontWeight: '600',
                        }}
                    >
                        Dismiss
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

function ScoreBoardRow({ name, score }: { name: string; score: number }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
            }}
        >
            <Text
                style={{
                    color: 'white',
                    fontSize: 18,
                }}
            >
                {name}
            </Text>
            <Text
                style={{
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: 18,
                }}
            >
                {score}
            </Text>
        </View>
    )
}
