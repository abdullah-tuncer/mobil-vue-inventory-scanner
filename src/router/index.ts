import { createRouter, createWebHistory } from 'vue-router'
import Anasayfa from '../components/Anasayfa.vue'
import Ayarlar from '../components/Ayarlar.vue'
import BarkodTarayici from '../components/BarkodTarayici.vue'
import BarkodOlusturucu from '../components/BarkodOlusturucu.vue'
import Envanter from '../components/Envanter.vue'
import EnvanterHareketi from '../components/EnvanterHareketi.vue'
import Satis from '../components/Satis.vue'
import UrunEkle from "../components/UrunEkle.vue";
import Urun from "../components/Urun.vue";
import EnvanterHareketiGecmis from "../components/EnvanterHareketiGecmis.vue";
import EnvanterHareketiGecmisDetay from "../components/EnvanterHareketiGecmisDetay.vue";

const routes = [
  {
    path: '/',
    name: 'Anasayfa',
    component: Anasayfa
  },
  {
    path: '/ayarlar',
    name: 'Ayarlar',
    component: Ayarlar
  },
  {
    path: '/barkod-tarayici',
    name: 'BarkodTarayici',
    component: BarkodTarayici
  },
  {
    path: '/barkod-olusturucu',
    name: 'BarkodOlusturucu',
    component: BarkodOlusturucu
  },
  {
    path: '/envanter',
    name: 'Envanter',
    component: Envanter
  },
  {
    path: '/envanter-hareketi',
    name: 'Envanter Hareketi',
    component: EnvanterHareketi
  },
  {
    path: '/envanter-hareketi-gecmis',
    name: 'Envanter Hareketi Geçmişi',
    component: EnvanterHareketiGecmis
  },
  {
    path: '/envanter-hareketi-gecmis-detay/:id',
    name: 'Envanter Hareketi Geçmiş Detayı',
    component: EnvanterHareketiGecmisDetay
  },
  {
    path: '/satis',
    name: 'Satis',
    component: Satis
  },
  {
    path: '/urun-ekle',
    name: 'UrunEkle',
    component: UrunEkle
  },
  {
    path: '/urun/:id',
    name: 'Urun',
    component: Urun
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router