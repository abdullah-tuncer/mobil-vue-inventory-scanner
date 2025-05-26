import { createRouter, createWebHistory } from 'vue-router'
import Anasayfa from '../components/Anasayfa.vue'
import Ayarlar from '../components/Ayarlar.vue'
import Envanter from '../components/Envanter.vue'
import EnvanterHareketi from '../components/EnvanterHareketi.vue'
import Satis from '../components/Satis.vue'
import UrunEkle from "../components/UrunEkle.vue";
import Urun from "../components/Urun.vue";
import EnvanterHareketiGecmis from "../components/EnvanterHareketiGecmis.vue";
import EnvanterHareketiGecmisDetay from "../components/EnvanterHareketiGecmisDetay.vue";
import SatisDetay from "../components/SatisDetay.vue";

export enum NavLocation{
  AYARLAR,
  ENVANTER,
  ANASAYFA,
  SATIS
}

const routes = [
  {
    path: '/',
    name: 'Anasayfa',
    component: Anasayfa,
    meta: {
      navLocation: NavLocation.ANASAYFA
    }
  },
  {
    path: '/ayarlar',
    name: 'Ayarlar',
    component: Ayarlar,
    meta: {
      navLocation: NavLocation.AYARLAR
    }
  },
  {
    path: '/envanter',
    name: 'Envanter',
    component: Envanter,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  },
  {
    path: '/envanter-hareketi',
    name: 'EnvanterHareketi',
    component: EnvanterHareketi,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  },
  {
    path: '/envanter-hareketi-gecmis',
    name: 'EnvanterHareketiGecmisi',
    component: EnvanterHareketiGecmis,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  },
  {
    path: '/envanter-hareketi-gecmis-detay/:id',
    name: 'EnvanterHareketiGecmisDetayi',
    component: EnvanterHareketiGecmisDetay,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  },
  {
    path: '/satis',
    name: 'Satis',
    component: Satis,
    meta: {
      navLocation: NavLocation.SATIS
    }
  },
  {
    path: '/satis-detay/:id',
    name: 'SatisDetay',
    component: SatisDetay,
    meta: {
      navLocation: NavLocation.SATIS
    }
  },
  {
    path: '/urun-ekle',
    name: 'UrunEkle',
    component: UrunEkle,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  },
  {
    path: '/urun/:id',
    name: 'Urun',
    component: Urun,
    meta: {
      navLocation: NavLocation.ENVANTER
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router