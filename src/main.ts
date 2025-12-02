import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { App } from './app/app';


Sentry.init({
  dsn: 'https://1c76391f03f6856bb9dfc4acd3043bf7@o4510462223646720.ingest.us.sentry.io/4510465815609344',

  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Configuración de rastreo
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Tasas de muestreo
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  release: 'oldschool-frontend@1.0.0',
  environment: 'production',

  sendDefaultPii: true,
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
