import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ConversationsView from '../views/ConversationsView.vue'

vi.mock('../components/ChatTab.vue', () => ({
  default: { name: 'ChatTab', template: '<div data-testid="chat-tab-stub">Chat panel</div>' },
}))

describe('conversations view (agents-api#68: the no-Workspace chat)', () => {
  it('renders the Conversations heading and the chat panel, with no Sessions/tab language', () => {
    const wrapper = mount(ConversationsView)

    expect(wrapper.get('h1').text()).toBe('Conversations')
    expect(wrapper.find('[data-testid="chat-tab-stub"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Sessions')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
  })
})
