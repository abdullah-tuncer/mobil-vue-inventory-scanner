import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Anasayfa from '../../src/components/Anasayfa.vue'
import { useSettingsStore } from '../../src/store/settingsStore'

// Capacitor modüllerini mock'layalım
vi.mock('@capacitor/clipboard', () => ({
  Clipboard: {
    write: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('../../src/services/inventoryService.ts', () => ({
  default: {
    getUrunByBarkod: vi.fn().mockResolvedValue({ id: 1, ad: 'Test Ürün' })
  }
}))

// Vue Router'ı mock'layalım
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Anasayfa', component: Anasayfa },
    { path: '/urun/:id', name: 'Urun', component: { template: '<div>Ürün Detay</div>' } }
  ]
})

// Vue3-Toastify'ı mock'layalım
vi.mock('vue3-toastify', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn()
  }
}))

describe('Anasayfa.vue', () => {
  beforeEach(() => {
    // Her test öncesi yeni bir pinia instance oluştur
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // SettingsStore'u hazırla
    const settingsStore = useSettingsStore()
    vi.spyOn(settingsStore, 'getAyarByKey').mockImplementation((key) => {
      if (key === 'sirket_adi') return 'Test Şirket'
      if (key === 'sirket_aciklama') return 'Test Açıklama'
      if (key === 'sirket_liste') return JSON.stringify(['Test Öğe 1', 'Test Öğe 2'])
      return null
    })
  })

  it('şirket adını ve açıklamasını doğru şekilde işler', () => {
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.find('h1').text()).toBe('Test Şirket')
    expect(wrapper.text()).toContain('Test Açıklama')
  })

  it('liste öğelerini doğru şekilde işler', () => {
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    const listItems = wrapper.findAll('.v-list-item-title')
    expect(listItems.length).toBe(2)
    expect(listItems[0].text()).toBe('Test Öğe 1')
    expect(listItems[1].text()).toBe('Test Öğe 2')
  })

  it('kopyalama simgesine tıklandığında metni panoya kopyalar', async () => {
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    // Kopyala ikonuna tıkla
    const copyIcon = wrapper.find('[data-test="copy-icon"]');
    await copyIcon.trigger('click')
    
    // Clipboard.write fonksiyonunun çağrıldığını kontrol et
    const { Clipboard } = await import('@capacitor/clipboard')
    expect(Clipboard.write).toHaveBeenCalledWith({ string: 'Test Öğe 1' })
    
    // Snackbar'ın gösterildiğini kontrol et
    await flushPromises()
    expect((wrapper.vm as any).snackbar).toBe(true)
  })

  it('paylaşım simgesine tıklandığında metni paylaşır', async () => {
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    // Paylaş ikonuna tıkla
    const shareIcon = wrapper.find('[data-test="share-icon"]')
    await shareIcon.trigger('click')
    
    // Share.share fonksiyonunun çağrıldığını kontrol et
    const { Share } = await import('@capacitor/share')
    expect(Share.share).toHaveBeenCalledWith({ text: 'Test Öğe 1' })
  })

  it('ürün barkodunu tarar ve ürün sayfasına gider', async () => {
    // Servis fonksiyonlarının çağrıldığını kontrol et
    const barkodTaramaService = (await import('../../src/services/BarkodTaramaService')).default;
    vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({type:"asd", data: '123456789' });
    const inventoryService = (await import('../../src/services/inventoryService')).default;

    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    // Router'ın push metodunu spy ile izle
    const routerPushSpy = vi.spyOn(router, 'push')
    
    // Tarama butonuna tıkla
    await wrapper.find('.tarayici-btn').trigger('click')

    expect(barkodTaramaService.scanBarcode).toHaveBeenCalled()
    expect(inventoryService.getUrunByBarkod).toHaveBeenCalledWith('123456789')
    
    // Router'ın push metodunun çağrıldığını kontrol et
    await flushPromises()
    expect(routerPushSpy).toHaveBeenCalledWith('/urun/1')
    vi.clearAllMocks();
  })

  it('ürün bulunamadığında uyarı bildirimi gösterir', async () => {
    // inventoryService.getUrunByBarkod'u null döndürecek şekilde mock'la
    const inventoryService = (await import('../../src/services/inventoryService')).default
    vi.mocked(inventoryService.getUrunByBarkod).mockResolvedValueOnce(null)
    
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    // Tarama butonuna tıkla
    await wrapper.find('.tarayici-btn').trigger('click')
    
    // Toast.warning fonksiyonunun çağrıldığını kontrol et
    await flushPromises()
    const { toast } = await import('vue3-toastify')
    expect(toast.warning).toHaveBeenCalledWith('Ürün Bulunamadı.')
  })

  it('barkod taraması başarısız olduğunda hata bildirimi gösterir', async () => {
    // barkodTaramaService.scanBarcode'u hata fırlatacak şekilde mock'la
    const barkodTaramaService = (await import('../../src/services/BarkodTaramaService')).default
    vi.mocked(barkodTaramaService.scanBarcode).mockRejectedValueOnce(new Error('Tarama hatası'))
    
    const wrapper = mount(Anasayfa, {
      global: {
        plugins: [router]
      }
    })
    
    // Tarama butonuna tıkla
    await wrapper.find('.tarayici-btn').trigger('click')
    
    // Toast.error fonksiyonunun çağrıldığını kontrol et
    await flushPromises()
    const { toast } = await import('vue3-toastify')
    expect(toast.error).toHaveBeenCalledWith('Tarama hatası')
  })
})