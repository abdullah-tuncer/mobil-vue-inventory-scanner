import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {tr} from "vuetify/locale";
import {md3} from "vuetify/blueprints";

export default createVuetify({
    blueprint: md3,
    locale: {
        locale: 'tr',
        fallback: 'tr',
        messages: {tr}
    },
    theme: {
        defaultTheme: 'dark',
    },
    components,
    directives
})