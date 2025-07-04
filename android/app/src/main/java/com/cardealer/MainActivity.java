package com.mrapps.cardealer;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import org.devio.rn.splashscreen.SplashScreen;

import android.os.Bundle;
import android.content.pm.ActivityInfo;

import android.content.Intent;
import android.content.res.Configuration;

import android.os.Build;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        super.onCreate(savedInstanceState);

        // if (getResources().getBoolean(R.bool.portrait_only)) {
        //   setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        // }
        
        // if (android.os.Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        //   setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        // }
    }

    @Override
    public void setRequestedOrientation(int requestedOrientation) {
      if (Build.VERSION.SDK_INT != Build.VERSION_CODES.O) {
          super.setRequestedOrientation(requestedOrientation);
      }
    }

   @Override
   public void onConfigurationChanged(Configuration newConfig) {
       super.onConfigurationChanged(newConfig);
       Intent intent = new Intent("onConfigurationChanged");
       intent.putExtra("newConfig", newConfig);
       this.sendBroadcast(intent);
   }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "cardealer";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
