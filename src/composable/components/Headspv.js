import func from '../../myfunction'

let lists = []

export const getHeadspv = async () => {
    lists = []
    lists = await func.getData({ store: 'Headspv', orderBy: 'id', desc: true })
    return true
}

export const getHeadspvId = async (headId) => {
    if(!lists.length) {
        await getHeadspv()
    }
    return lists.find((rec) => rec?.id === headId)
}