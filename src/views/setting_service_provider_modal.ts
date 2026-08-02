import { ServiceProvider } from '@src/constants';
import BookSearchPlugin from '@src/main';
import { Modal, Setting } from 'obsidian';

export class SettingServiceProviderModal extends Modal {
  private readonly plugin: BookSearchPlugin;
  private readonly currentServiceProvider: ServiceProvider;

  constructor(
    plugin: BookSearchPlugin,
    private callback?: () => void,
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.currentServiceProvider = plugin.settings?.serviceProvider ?? ServiceProvider.google;
  }

  get settings() {
    return this.plugin.settings;
  }

  async saveSetting() {
    return this.plugin.saveSettings();
  }

  saveClientId(clientId: string) {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      this.plugin.settings['naverClientId'] = clientId;
    }
  }

  saveClientSecret(clientSecret: string) {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      this.settings['naverClientSecret'] = clientSecret;
    }
  }

  get currentClientId() {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      return this.settings.naverClientId;
    }
    return '';
  }

  get currentClientSecret() {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      return this.settings.naverClientSecret;
    }
    return '';
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Service Provider Setting' });

    if (this.currentServiceProvider === ServiceProvider.kakao) {
      // 카카오 책 검색은 REST API 키 하나만 사용한다.
      new Setting(contentEl)
        .setName('REST API Key')
        .setDesc('카카오 개발자센터(developers.kakao.com)의 [내 애플리케이션 > 앱 키]에서 발급받은 REST API 키')
        .addText(text => {
          text.setValue(this.settings.kakaoRestApiKey ?? '').onChange(value => {
            this.settings.kakaoRestApiKey = value.trim();
          });
        });
    } else {
      new Setting(contentEl).setName('Client ID').addText(text => {
        text.setValue(this.currentClientId).onChange(value => this.saveClientId(value));
      });

      new Setting(contentEl).setName('Client Secret').addText(text => {
        text.setValue(this.currentClientSecret).onChange(value => this.saveClientSecret(value));
      });
    }

    new Setting(contentEl).addButton(btn =>
      btn
        .setButtonText('Save')
        .setCta()
        .onClick(async () => {
          await this.plugin.saveSettings();
          this.close();
          this.callback?.();
        }),
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}
