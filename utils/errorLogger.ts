
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 100);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // Skip the first few lines (Error, getCallerInfo, console override)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
      const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
      if (match) {
        return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
      }
    }
  }

  return '';
};

export const setupErrorLogging = () => {
  console.log('Setting up error logging...');
  
  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: message,
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          error: error?.stack || error,
          timestamp: new Date().toISOString()
        };

        console.error('🚨 RUNTIME ERROR:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (err) {
        console.error('Error in window.onerror handler:', err);
      }
      return false; // Don't prevent default error handling
    };

    // Check if platform is web
    if (Platform.OS === 'web') {
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const errorData = {
            reason: event.reason,
            timestamp: new Date().toISOString(),
            stack: event.reason?.stack || 'No stack trace available',
            message: event.reason?.message || 'Unknown promise rejection'
          };

          console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
          
          // Prevent the default unhandled rejection behavior
          event.preventDefault();
        } catch (err) {
          console.error('Error in unhandledrejection handler:', err);
        }
      });

      // Also handle rejectionhandled events
      window.addEventListener('rejectionhandled', (event) => {
        try {
          console.log('🔄 PROMISE REJECTION HANDLED:', event.reason);
        } catch (err) {
          console.error('Error in rejectionhandled handler:', err);
        }
      });
    }
  }

  // Add global promise rejection handler for React Native
  if (typeof global !== 'undefined' && global.HermesInternal) {
    // This is for Hermes engine
    const originalPromiseRejectionHandler = global.HermesInternal.hasPromiseRejectionTrackingMethods?.() 
      ? global.HermesInternal.enablePromiseRejectionTracker 
      : null;
      
    if (originalPromiseRejectionHandler) {
      global.HermesInternal.enablePromiseRejectionTracker({
        allRejections: true,
        onUnhandled: (id: number, rejection: any) => {
          try {
            console.error('🚨 HERMES UNHANDLED PROMISE REJECTION:', { id, rejection });
            sendErrorToParent('error', 'Hermes Unhandled Promise Rejection', { id, rejection });
          } catch (err) {
            console.error('Error in Hermes promise rejection handler:', err);
          }
        },
        onHandled: (id: number) => {
          console.log('🔄 HERMES PROMISE REJECTION HANDLED:', id);
        }
      });
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Override console.error to capture more detailed information
  console.error = (...args: any[]) => {
    try {
      const stack = new Error().stack || '';
      const sourceInfo = extractSourceLocation(stack);
      const callerInfo = getCallerInfo();

      // Create enhanced message with source information
      const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

      // Add timestamp and make it stand out in Metro logs
      originalConsoleError('🔥 ERROR:', new Date().toISOString(), enhancedMessage);

      // Also send to parent
      sendErrorToParent('error', 'Console Error', enhancedMessage);
    } catch (err) {
      // Fallback to original console.error if our enhancement fails
      originalConsoleError('Error in console.error override:', err);
      originalConsoleError(...args);
    }
  };

  // Override console.warn to capture warnings with source location
  console.warn = (...args: any[]) => {
    try {
      const stack = new Error().stack || '';
      const sourceInfo = extractSourceLocation(stack);
      const callerInfo = getCallerInfo();

      // Filter out common React Native warnings that are not actionable
      const message = args.join(' ');
      const ignoredWarnings = [
        'VirtualizedLists should never be nested',
        'componentWillReceiveProps has been renamed',
        'componentWillMount has been renamed',
        'componentWillUpdate has been renamed',
        'Failed prop type',
        'Warning: React.createElement',
        'Warning: validateDOMNesting',
        'Warning: Each child in a list should have a unique "key" prop',
        'Require cycle:',
        'Remote debugger',
        'Animated: `useNativeDriver`',
        'Possible Unhandled Promise Rejection',
        'Setting a timer for a long period of time',
        'Non-serializable values were found in the navigation state'
      ];

      // Check if this is a warning we should ignore
      const shouldIgnore = ignoredWarnings.some(ignored => 
        message.toLowerCase().includes(ignored.toLowerCase())
      );

      if (shouldIgnore) {
        // Still log to console but don't send to parent
        originalConsoleWarn('⚠️ WARNING (filtered):', new Date().toISOString(), message);
        return;
      }

      // Create enhanced message with source information
      const enhancedMessage = message + sourceInfo + callerInfo;

      originalConsoleWarn('⚠️ WARNING:', new Date().toISOString(), enhancedMessage);

      // Also send to parent
      sendErrorToParent('warn', 'Console Warning', enhancedMessage);
    } catch (err) {
      // Fallback to original console.warn if our enhancement fails
      originalConsoleWarn('Error in console.warn override:', err);
      originalConsoleWarn(...args);
    }
  };

  // Try to intercept React Native warnings at a lower level
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    try {
      // Override React's warning system if available
      const originalWarn = (window as any).console?.warn || console.warn;

      // Monkey patch any React warning functions
      if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (internals.ReactDebugCurrentFrame) {
          const originalGetStackAddendum = internals.ReactDebugCurrentFrame.getStackAddendum;
          internals.ReactDebugCurrentFrame.getStackAddendum = function() {
            try {
              const stack = originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
              return stack + ' | Enhanced by error logger';
            } catch (err) {
              console.error('Error in React stack addendum override:', err);
              return originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
            }
          };
        }
      }
    } catch (err) {
      console.error('Error setting up React warning interception:', err);
    }
  }

  console.log('✅ Error logging setup complete');
};
