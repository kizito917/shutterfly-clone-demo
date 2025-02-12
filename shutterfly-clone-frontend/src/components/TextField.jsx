export default function TextField({ type, placeholder, defaultValue, name, register, errors, onChange }) {
    return (
        <>
            <input defaultValue={defaultValue} type={type} placeholder={placeholder} name={name} className='w-full h-12 border border-gray-200 rounded-md px-2' {...register(name)} onChange={onChange} />
            {errors[name] && <p className='text-red-400 text-sm mt-2'>{errors[name].message}</p>}
        </>
    )
}