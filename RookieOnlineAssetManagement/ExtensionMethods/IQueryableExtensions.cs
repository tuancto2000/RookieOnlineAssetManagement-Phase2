using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.ExtensionMethods
{
    public static class IQueryableExtensions
    {
        public static IQueryable<TSource> Paged<TSource>(this IQueryable<TSource> source, int page, int pageSize)
        {
            return source.Skip((page - 1) * pageSize).Take(pageSize);
        }
        public static IQueryable<T> WhereIf<T>(this IQueryable<T> query, bool condition, Expression<Func<T, bool>> predicate)
        {
            if (condition)
            {
                return query.Where(predicate);
            }
            return query;
        }
        public static IQueryable<TSource> OrderByIf<TSource, TKey>(this IQueryable<TSource> query, bool condition, Expression<Func<TSource, TKey>> keySelector, bool ascending)
        {
            if (condition)
            {
                return ascending ? query.OrderBy(keySelector) : query.OrderByDescending(keySelector);
            }
            return query;
        }
        public static TSource FirstIf<TSource, TKey1, TKey2>(this IQueryable<TSource> query, bool condition1, bool condition2,
            Expression<Func<TSource, TKey1>> KeySelector1, Expression<Func<TSource, TKey2>> KeySelector2)
        {
            if (condition1)
            {
                return query.OrderByDescending(KeySelector1).FirstOrDefault();
            }
            else 
            {
                return query.OrderByDescending(KeySelector2).FirstOrDefault();
            }    
        }
    }
}
