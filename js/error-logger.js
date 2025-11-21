/**
 * エラーログ自動収集システム
 * 
 * ブラウザのコンソールエラーを自動的にサーバーに送信して保存
 */

class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.sendInterval = 5000; // 5秒ごとに送信
        this.setupLogger();
        this.startAutoSend();
    }

    setupLogger() {
        // console.logをインターセプト
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.addLog('log', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('error', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('warn', args);
            originalWarn.apply(console, args);
        };

        // グローバルエラーをキャッチ
        window.addEventListener('error', (event) => {
            this.addLog('error', [
                `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`
            ]);
        });

        // Promise のエラーをキャッチ
        window.addEventListener('unhandledrejection', (event) => {
            this.addLog('error', [
                `Unhandled Promise Rejection: ${event.reason}`
            ]);
        });
    }

    addLog(level, args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        const logEntry = {
            timestamp,
            level,
            message,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.logs.push(logEntry);

        // ログが多すぎる場合は古いものを削除
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    async sendLogs() {
        if (this.logs.length === 0) return;

        try {
            const logsToSend = [...this.logs];
            this.logs = []; // 送信前にクリア

            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ logs: logsToSend })
            });

            if (!response.ok) {
                // 送信失敗時は元に戻す
                this.logs = [...logsToSend, ...this.logs];
            }
        } catch (error) {
            // エラー時は何もしない（無限ループを防ぐ）
        }
    }

    startAutoSend() {
        setInterval(() => {
            this.sendLogs();
        }, this.sendInterval);

        // ページ離脱時も送信
        window.addEventListener('beforeunload', () => {
            if (this.logs.length > 0) {
                // 同期的に送信（ページ離脱を待つ）
                navigator.sendBeacon('/api/logs', JSON.stringify({ logs: this.logs }));
            }
        });
    }

    // ログを手動でダウンロード
    downloadLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `console-logs-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// 自動的に起動
const errorLogger = new ErrorLogger();

// グローバルに公開（手動ダウンロード用）
window.errorLogger = errorLogger;
