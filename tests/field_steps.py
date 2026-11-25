from playwright.sync_api import expect


def verify_steps(page, article, entry, commands, *, web=False, reopen=None):
    for index, (heading, paragraph, targets) in enumerate(article['steps']):
        step = entry.locator('.field-step').nth(index)
        expect(step.get_by_text(heading, exact=True)).to_be_visible()
        expect(step.get_by_text(paragraph, exact=True)).to_be_visible()
        for key in targets:
            if key in commands:
                step.locator(f'[data-field-command="{key}"]').click()
                c = commands[key]
                expect(page.locator('#modal h2')).to_have_text(c['title'])
                expect(page.locator('#command-preview')).to_have_value(c['command'])
                if c['risk'] == 'change':
                    expect(page.locator('#copy-command')).to_be_disabled()
                    page.locator('#command-ack').check()
                page.locator('#copy-command').click()
                page.wait_for_function('async text => await navigator.clipboard.readText() === text', arg=c['command'])
                if web:
                    page.go_back()
                else:
                    page.locator('#modal [data-close]').click()
            else:
                step.get_by_text('요청 ID로 재시도 추적 · 로그 돋보기 열기', exact=True).click()
                expect(page.locator('#logs-scenario option:checked')).to_have_text('요청 ID로 재시도 추적')
                if page.locator('#logs-input').input_value():
                    page.once('dialog', lambda d: d.accept())
                page.locator('#logs-sample').click()
                output = page.locator('#logs-output')
                assert 'REQ-1042 done status=200' in output.input_value()
                assert 'REQ-1043' not in output.input_value() and 'Caused by:' not in output.input_value()
                page.locator('#logs-context').select_option('1')
                page.locator('#logs-run').click()
                assert 'worker-7 Caused by: java.net.SocketTimeoutException' in output.input_value()
                if web:
                    page.go_back()
                else:
                    reopen()
                    entry.locator('summary').click()
