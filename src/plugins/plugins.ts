import type { SlidesPlugin } from '../types'
import { bibCompactor, bibFiltering } from './bibPlugins'
export { bibCompactor, bibFiltering } from './bibPlugins'

export function createPluginPack(packName: 'default'): SlidesPlugin[] {
    switch (packName) {
        case 'default':
        return [
            bibFiltering(),
            bibCompactor(),
        ]
    default:
        throw new Error(`Unknown plugin set: ${packName}`)
    }
}
