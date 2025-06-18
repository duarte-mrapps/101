import React, { createContext, useState, useContext } from 'react';
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Dimensions, Text, Platform } from 'react-native';
import { Button, List, TitleFontSize } from 'react-native-ui-devkit';
import { Appearance } from 'react-native';
import { isTablet } from 'react-native-device-info';

const DialogContext = createContext({ showDialog: null, reload: null, hideDialog: null });

export const useDialog = () => {
  return useContext(DialogContext);
};

export const DialogProvider = ({ children }) => {
  const [options, setOptions] = useState({ visible: false, data: null, okButton: null, cancelButton: null, colors: null, contextTemp: null });
  const { width, height } = Dimensions.get('screen')
  const theme = Appearance.getColorScheme()

  const showDialog = (options) => {
    setOptions(options || null);
  };

  const hideDialog = (ok) => {
    options?.exec && options.exec(ok, options.contextTemp);
    setOptions({ visible: false, data: null, okButton: null, cancelButton: null, colors: null, contextTemp: null });
  };

  const reload = (data, contextTemp) => {
    data && setOptions(prev => { return { ...prev, data, contextTemp } });
  };

  const dialogComponent = () => (
    <Modal visible={options?.visible} animationType="fade" transparent={true} onRequestClose={() => { hideDialog(false) }} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={() => { hideDialog(false) }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <View style={{
            flex: 1,
            width: ((isTablet() || Platform.isPad) && width >= 768) ? '56%' : '100%',
            maxHeight: height * 0.8,
            position: 'absolute',
            ...!options?.center && {
              paddingLeft: 10,
              right: 0,
            },
            ...!isTablet() && {
              paddingRight: 10,
            },
            ...options?.center && {
              alignSelf: 'center'
            },
            bottom: 10
          }}>
            <View style={{
              flex: 1,
              paddingTop: 10,
              backgroundColor: theme == 'dark' ? "#222222" : '#fff',
              borderRadius: 25,
              overflow: 'hidden'
            }}>
              {options?.title && <Text style={[{ fontWeight: 'bold', marginLeft: 20, marginTop: 10, color: options?.colors?.text }, TitleFontSize()]}>{options?.title}</Text>}
              <ScrollView style={{ flex: 1, paddingTop: 10, maxHeight: height / 1.5 }}>
                {options?.data?.map((section, sectionIndex) => {
                  const formattedData = section?.data?.map((entry) => {
                    if (!entry) return null

                    const newStyle = { backgroundColor: 'transparent', ...(isTablet() || Platform.isPad) && width >= 768 ? { marginLeft: 0 } : {} }

                    return { ...entry, noDivider: true, style: newStyle }
                  })

                  return (
                    <List
                      key={sectionIndex}
                      data={formattedData}
                      header={section.header}
                      forceHeader
                      expanded
                      colors={options?.colors}
                    />
                  )
                })}
              </ScrollView>
              <View style={{ marginBottom: 12, marginHorizontal: 20 }}>
                {options?.okButton && <Button data={{ title: 'Concluir', color: options?.colors?.text, onPress: () => { hideDialog(true) } }} transparent small />}
                {options?.cancelButton && <Button data={{ title: 'Cancelar', color: options?.colors?.text, onPress: () => { hideDialog(false) } }} transparent small />}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const value = { showDialog, hideDialog, reload };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialogComponent()}
    </DialogContext.Provider>
  );
};