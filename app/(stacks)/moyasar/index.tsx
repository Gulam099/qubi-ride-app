import { View, Text, ScrollView, StyleSheet, Button } from 'react-native'
import React from 'react'

const MoyasarPayment = () => {
  const errorMessage = `
   CRITICAL PAYMENT SYSTEM FAILURE 
  ----------------------------------------------------
   Unhandled Exception 

  FATAL ERROR: Moyasar crashed the payment flow.
  
   Error Details:
  TypeError: Cannot read properties of undefined (reading 'init')
    at Moyasar.init (PaymentModule.js:132)
    at handlePayment (MoyasarPayment.js:45)
    at onPress (MoyasarPayment.js:28)
    at TouchableHighlight._performSideEffectsForTransition (TouchableHighlight.js:923)
    at ReactNativeRenderer.dispatchEvent (ReactNativeRenderer.js:15522)
    at invokeGuardedCallbackDev (ReactErrorUtils.js:71)
    at Object.invokeGuardedCallback (ReactErrorUtils.js:220)
    at invokeGuardedCallbackAndCatchFirstError (ReactErrorUtils.js:239)
    ...
  
   Stack Trace Truncated 

   Suggested Actions:
  - Re-check your Moyasar public key & backend integration
  - Restart the app
  - Sacrifice a goat 🐐 and try again
  
  System Info Dump:
  ------------------------
  Device: Pixel 6 - Android 13
  App Version: 1.3.2-beta
  Timestamp: ${new Date().toISOString()}
  Session ID: ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}
  ------------------------

  Contact support immediately.
  `

  // Simulate a real app-crashing error
  throw new Error("FATAL: Moyasar payment crashed the session.\n\n" + errorMessage)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💥 Payment Failed</Text>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Retry Payment" onPress={() => {}} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff0f0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'crimson',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#2b2b2b',
    backgroundColor: '#ffe6e6',
    padding: 15,
    borderRadius: 8,
    fontFamily: 'Courier',
  },
  buttonContainer: {
    marginTop: 30,
    alignSelf: 'center',
  },
})

export default MoyasarPayment
